// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {IClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract gn is EIP712, Ownable {
    using ECDSA for bytes32;

    IRouterClient private s_router;

    bytes32 private INITIATE_TYPEHASH =
        keccak256(
            "initiateTransaction(address sender,address receiver,uint256 amount,string tokenName,uint256 chainId,uint256 secretPin)"
        );
    bytes32 private SIGNER_TYPEHASH =
        keccak256(
            "signByReceiver(address sender,address receiver,uint256 amount,string tokenName,uint256 chainId,uint256 secretPin)"
        );

    struct Transaction {
        address sender;
        address receiver;
        uint256 amount;
        address tokenAddress;
        string tokenName;
        uint256 chainId;
        uint256 secretPin;
    }

    event TokensTransferred(
        bytes32 indexed messageId, // The unique ID of the message.
        uint64 indexed destinationChainSelector, // The chain selector of the destination chain.
        address receiver, // The address of the receiver on the destination chain.
        address token, // The token address that was transferred.
        uint256 tokenAmount, // The token amount that was transferred.
        address feeToken, // the token address used to pay CCIP fees.
        uint256 fees // The fees paid for sending the message.
    );

    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees);

    mapping(uint256 => uint64) public chainIdTochainSelectorMapping;

    //base chain selector: 10344971235874465080 chain Id :84532

    // router address for CCIP
    constructor(address _router) EIP712("gn", "1") Ownable(msg.sender) {
        s_router = IRouterClient(_router); //0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165
    }

    function setChainSelector(
        uint64 _chainSelector,
        uint256 _chainId
    ) public onlyOwner {
        chainIdTochainSelectorMapping[_chainId] = _chainSelector;
    }

    function initiateTransaction(
        bytes memory signature,
        Transaction memory _transaction
    ) internal view returns (address) {
        require(_transaction.amount > 0, "Amount must be greater than 0");
        require(_transaction.sender != address(0), "Invalid receiver address");

        bytes32 structHash = keccak256(
            abi.encode(
                INITIATE_TYPEHASH,
                _transaction.sender,
                _transaction.receiver,
                _transaction.amount,
                keccak256(bytes(_transaction.tokenName)),
                _transaction.chainId,
                _transaction.secretPin
            )
        );

        bytes32 hash = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(hash, signature);
        return signer;
    }

    function signByReceiver(
        bytes memory signature,
        Transaction memory _transaction
    ) internal view returns (address) {
        require(_transaction.amount > 0, "Amount must be greater than 0");
        require(
            _transaction.receiver != address(0),
            "Invalid receiver address"
        );

        bytes32 structHash = keccak256(
            abi.encode(
                SIGNER_TYPEHASH,
                _transaction.sender,
                _transaction.receiver,
                _transaction.amount,
                keccak256(bytes(_transaction.tokenName)),
                _transaction.chainId,
                _transaction.secretPin
            )
        );

        bytes32 hash = _hashTypedDataV4(structHash);

        address signer = ECDSA.recover(hash, signature);
        return signer;
    }

    function transferNative(
        bytes memory senderSign,
        bytes memory receiverSign,
        Transaction memory _transaction
    ) external payable {
        require(_transaction.amount > 0, "Amount must be greater than 0");
        require(
            _transaction.receiver != address(0),
            "Invalid receiver address"
        );
        require(_transaction.sender != address(0), "Invalid sender address");

        address sender = initiateTransaction(senderSign, _transaction);
        address receiver = signByReceiver(receiverSign, _transaction);

        require(sender == _transaction.sender, "Invalid signature of sender");
        require(
            receiver == _transaction.receiver,
            "Invalid signature of receiver"
        );

        payable(_transaction.receiver).transfer(msg.value);
    }

    function transferTokens(
        bytes memory senderSign,
        bytes memory receiverSign,
        Transaction memory _transaction
    ) external {
        require(_transaction.amount > 0, "Amount must be greater than 0");
        require(
            _transaction.receiver != address(0),
            "Invalid receiver address"
        );
        require(_transaction.sender != address(0), "Invalid sender address");

        address sender = initiateTransaction(senderSign, _transaction);
        address receiver = signByReceiver(receiverSign, _transaction);

        require(sender == _transaction.sender, "Invalid signature of sender");
        require(
            receiver == _transaction.receiver,
            "Invalid signature of receiver"
        );

        IERC20 token = IERC20(_transaction.tokenAddress);

        if (_transaction.chainId != block.chainid) {
            require(
                token.transferFrom(
                    _transaction.sender,
                    _transaction.receiver,
                    _transaction.amount
                ),
                "Token transfer failed"
            );
        } else {
            token.transferFrom(
                _transaction.sender,
                address(this),
                _transaction.amount
            );

            transferTokensPayNative(
                chainIdTochainSelectorMapping[_transaction.chainId],
                _transaction.receiver,
                _transaction.tokenAddress,
                _transaction.amount
            );
        }
    }

    function transferFromWithPermit(
        bytes memory senderSign,
        bytes memory receiverSign,
        uint256 deadline,
        Transaction memory _transaction,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(_transaction.amount > 0, "Amount must be greater than 0");
        require(
            _transaction.receiver != address(0),
            "Invalid receiver address"
        );
        require(_transaction.sender != address(0), "Invalid sender address");

        address sender = initiateTransaction(senderSign, _transaction);
        address receiver = signByReceiver(receiverSign, _transaction);

        require(sender == _transaction.sender, "Invalid signature of sender");
        require(
            receiver == _transaction.receiver,
            "Invalid signature of receiver"
        );

        IERC20Permit _token = IERC20Permit(_transaction.tokenAddress);
        IERC20 token = IERC20(_transaction.tokenAddress);
        _token.permit(
            _transaction.sender,
            address(this),
            _transaction.amount,
            deadline,
            v,
            r,
            s
        );
        require(
            token.transferFrom(
                _transaction.sender,
                _transaction.receiver,
                _transaction.amount
            ),
            "Token transfer failed"
        );
    }

    //CCIP Implementation to send Tokens Cross chain

    function transferTokensPayNative(
        uint64 _destinationChainSelector,
        address _receiver,
        address _token,
        uint256 _amount
    ) internal returns (bytes32 messageId) {
        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        // address(0) means fees are paid in native gas
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            _token,
            _amount,
            address(0)
        );

        // Get the fee required to send the message
        uint256 fees = s_router.getFee(
            _destinationChainSelector,
            evm2AnyMessage
        );

        if (fees > address(this).balance)
            revert NotEnoughBalance(address(this).balance, fees);

        // approve the Router to spend tokens on contract's behalf. It will spend the amount of the given token
        IERC20(_token).approve(address(s_router), _amount);

        // Send the message through the router and store the returned message ID
        messageId = s_router.ccipSend{value: fees}(
            _destinationChainSelector,
            evm2AnyMessage
        );

        // Emit an event with message details
        emit TokensTransferred(
            messageId,
            _destinationChainSelector,
            _receiver,
            _token,
            _amount,
            address(0),
            fees
        );

        // Return the message ID
        return messageId;
    }

    function getEstimatedFees(
        uint64 __destinationChainSelector,
        address _receiver,
        address _token,
        uint256 _amount
    ) public view returns (uint256) {
        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        // address(0) means fees are paid in native gas
        Client.EVM2AnyMessage memory evm2AnyMessage = _buildCCIPMessage(
            _receiver,
            _token,
            _amount,
            address(0)
        );
        IRouterClient router = IRouterClient(address(s_router));
        return router.getFee(__destinationChainSelector, evm2AnyMessage);
    }

    function _buildCCIPMessage(
        address _receiver,
        address _token,
        uint256 _amount,
        address _feeTokenAddress
    ) private pure returns (Client.EVM2AnyMessage memory) {
        // Set the token amounts
        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: _token,
            amount: _amount
        });

        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        return
            Client.EVM2AnyMessage({
                receiver: abi.encode(_receiver), // ABI-encoded receiver address
                data: "", // No data
                tokenAmounts: tokenAmounts, // The amount and type of token being transferred
                extraArgs: Client._argsToBytes(
                    // Additional arguments, setting gas limit to 0 as we are not sending any data
                    Client.EVMExtraArgsV1({gasLimit: 0})
                ),
                // Set the feeToken to a feeTokenAddress, indicating specific asset will be used for fees
                feeToken: _feeTokenAddress
            });
    }

    receive() external payable {}
}
