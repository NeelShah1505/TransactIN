"use client";

import React, { useEffect, useState } from "react";
import { getTokenDetails, TokenDetails } from "@/utils/getTokenDetails";
import { useAccount } from "wagmi";
import { formatUnits, Address, WalletClient } from "viem";
import { createWalletClient, custom } from "viem";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { parseUnits, parseEther } from "viem";
import {
  formSchemaLoadToken,
  formSchemaTransaction,
} from "@/utils/initiateTxFormSchema";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { arbitrumSepolia } from "viem/chains";
import CustomSelect from "@/components/common/CustomSelect";
import Header from "@/components/header/Header";
import {
  SignProtocolClient,
  SpMode,
  OffChainSignType,
  OffChainRpc,
  DataLocationOffChain,
  IndexService,
} from "@ethsign/sp-sdk";
import { useRouter } from "next/navigation";

interface Transaction {
  sender: string;
  receiver: string;
  token: string;
  amount: string;
}

interface FormErrors {
  receiver?: string[];
  amount?: string[];
  token?: string[];
  secretpin?: string[];
}

const InitiateTransaction: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingToken, setIsLoadingToken] = useState<boolean>(false);
  const [errorDisplay, setErrorDisplay] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors | undefined>();
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [secretPin, setSecretPin] = useState<number>(0);
  const [errorLoadToken, setErrorLoadToken] = useState<string | undefined>();
  const [transaction, setTransaction] = useState<Transaction>({
    sender: "",
    receiver: "",
    token: "",
    amount: "",
  });
  const [isERC20, setIsERC20] = useState<boolean>(false);
  const defaultTokenDetails: TokenDetails = {
    name: "",
    symbol: "",
    decimals: "",
    balance: BigInt(0),
  };
  const router = useRouter()

  const [tokenDetails, setTokenDetails] =
    useState<TokenDetails>(defaultTokenDetails);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTransaction({ ...transaction, [name]: value });
  };

  const loadTokenDetails = async () => {
    setErrorLoadToken("");
    setErrorDisplay(false);
    const formData = {
      token: transaction.token,
    };

    try {
      formSchemaLoadToken.parse(formData);
      setIsLoadingToken(true);
      console.log(transaction.token, address);
      const getToken: any = await getTokenDetails(
        transaction.token,
        address as string
      );
      console.log(getToken);
      if (getToken !== null) {
        setTokenDetails(getToken);
      }
    } catch (err: any) {
      console.log(err);
      setErrorLoadToken(err.formErrors?.fieldErrors?.token);
      setErrorDisplay(true);
    } finally {
      setIsLoadingToken(false);
    }
  };

  useEffect(() => {
    if (!isERC20) {
      setTokenDetails(defaultTokenDetails);
      setTransaction({ ...transaction, token: "" });
    }
  }, [isERC20]);

  const handleCheckboxChange = () => {
    setIsERC20(!isERC20);
  };

  // sign protocol client
  let walletClient: WalletClient;
  if (typeof window !== "undefined" && window.ethereum) {
    walletClient = createWalletClient({
      chain: arbitrumSepolia,
      transport: custom(window ? window.ethereum : ""),
    });
  }

  const handleAttest = async (sign: string) => {
    // Create attestation
    const client = new SignProtocolClient(SpMode.OffChain, {
      signType: OffChainSignType.EvmEip712,
      rpcUrl: OffChainRpc.testnet,
      walletClient: walletClient,
    });
    const schemahex = await client.getSchema("SPS_Y8tHQJa7DiEnQTU_qyIQW"); //schema ID
    console.log(schemahex);
    const attestationInfo = await client.createAttestation({
      schemaId: "SPS_Y8tHQJa7DiEnQTU_qyIQW", //schema ID
      data: {
        receiver: transaction.receiver,
        token: transaction.token,
        amount: "1000000",
        chainId: selectedNetwork,
        sign: sign,
        // age: 24,
      },
      recipients: [transaction.receiver],
      indexingValue: transaction.sender,
    });
    console.log(attestationInfo);

    return attestationInfo;
  };
  const signTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorDisplay(false);

    const formData = {
      receiver: transaction.receiver,
      amount: transaction.amount,
      token: isERC20 ? transaction.token : undefined,
    };

    const { ethereum } = window as any;
    if (!ethereum) {
      throw new Error("Metamask is not installed, please install!");
    }

    try {
      formSchemaTransaction.parse(formData);
      setIsLoading(true);
      var amount: any = transaction.amount;
      if (isERC20) {
        amount = parseUnits(
          transaction.amount,
          parseInt(tokenDetails.decimals ? tokenDetails.decimals : "")
        );
      } else {
        amount = parseEther(transaction.amount);
      }

      const signature = await walletClient.signTypedData({
        account: address as Address,
        domain: {
          name: "gn",
          version: "1",
          chainId: BigInt(421614),
          verifyingContract: "0x1302017D2d3aA9Fe213cd7F9fa76d9299722690E", //contract address
        },
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          initiateTransaction: [
            { name: "sender", type: "address" },
            { name: "receiver", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "tokenName", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "secretPin", type: "uint256" },
          ],
        },
        primaryType: "initiateTransaction",
        message: {
          // nonce: BigInt(nonce),
          sender: address as Address,
          receiver: transaction.receiver as Address,
          amount: amount,
          tokenName: tokenDetails.symbol ? tokenDetails.symbol : "ETH",
          chainId: BigInt(selectedNetwork),
          secretPin: BigInt(secretPin),
        },
      });
      const currentDate = new Date();
      console.log("Signature:", signature);
      if (signature) {
        const attestationInfo = await handleAttest(signature);
        console.log(attestationInfo);
        console.log("storing data on the db");

        const userData = {
          senderAddress: address,
          receiverAddress: transaction.receiver,
          amount: BigInt(amount).toString(),
          tokenAddress: transaction.token,
          senderSignature: signature,
          receiverSignature: "",
          status: "inititated",
          tokenName: tokenDetails.symbol !== "" ? tokenDetails.symbol : "ETH",
          initiateDate: currentDate,
          decimals: tokenDetails.symbol !== "" ? tokenDetails.decimals : 18,
          chainId: BigInt(selectedNetwork).toString(),
          attestationId: attestationInfo.attestationId,
        };
        console.log(userData);
        let result = await fetch(`api/store-transaction`, {
          method: "POST",
          body: JSON.stringify(userData),
        });
        const response = await result.json();
        console.log(response);
        try {
          console.log("entered into try block");
          toast.success("Signed Successfully");
          setIsLoading(false);
          router.push('/dashboard')
        } catch (error) {
          toast.error("Error while signing");
          setIsLoading(false);
          console.error("Error signing transaction:", error);
        }
      }
    } catch (err: any) {
      console.log(err.formErrors ? err.formErrors : err);
      setErrors(err.formErrors?.fieldErrors);
      setErrorDisplay(true);
      console.error("Error signing transaction:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (transaction.receiver || transaction.token || transaction.amount) {
      setErrors({});
      setErrorDisplay(false);
    }

    return () => {
      setErrors({});
      setErrorDisplay(false);
    };
  }, [transaction.receiver, transaction.token, transaction.amount]);

  return (
    <>
      <Header />
      <div className="w-full min-h-screen flex flex-col justify-center items-center z-[99999999]">
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-600 to-orange-400 m-5 font-bold text-4xl text-center">
          Send Transaction
        </h1>

        <div className="bg-white shadow-custom rounded-lg shadow-lg overflow-hidden w-[40em] my-8 opacity-100 transition-all duration-300 ease-in-out">
          <div className="relative">
            <form
              className="mt-6 flex flex-col justify-start w-full p-6"
              onSubmit={signTransaction}
            >
              <div className="w-full mb-4">
                <label className="self-left text-gray-700 text-xs mb-1">
                  Receiver Address
                </label>
                <input
                  type="text"
                  name="receiver"
                  placeholder="Enter Receiver's Address"
                  className={`w-full bg-transparent p-3 border rounded-lg text-black ${errorDisplay && errors?.receiver
                    ? "border-red-500"
                    : "border-[#2d2d2d]"
                    }`}
                  value={transaction.receiver || ""}
                  onChange={handleInputChange}
                />
                {errorDisplay && errors?.receiver && (
                  <span className="text-red-600 text-left mt-2 text-sm">
                    *{errors.receiver}
                  </span>
                )}
              </div>

              {/* <select
                                className="w-full p-2 border rounded-lg text-black"
                                value={selectedNetwork} // Assume you have this state variable
                                onChange={(e) => setSelectedNetwork(e.target.value)} // Update this function as needed
                            >
                                <option value="">Select Network</option>
                                <option value="arbitrum-sepolia">Arbitrum Sepolia</option>
                                <option value="base-sepolia">Base Sepolia</option>
                            </select> */}
              <CustomSelect
                selectedOption={selectedNetwork}
                setSelectedOption={setSelectedNetwork}
              />

              <div className="w-full mb-4 ">
                <label className="text-left text-gray-700 text-xs mb-1">
                  Do you want to send ERC-20 token?
                </label>
                <div
                  className={`flex items-center cursor-pointer w-full p-3 border rounded-lg text-black ${errorDisplay && errorLoadToken
                    ? "border-red-500"
                    : "border-[#2d2d2d]"
                    }`}
                  onClick={handleCheckboxChange}
                >
                  <input
                    type="checkbox"
                    checked={isERC20}
                    className=" h-5 w-5 text-indigo-600 "
                  />
                  <span className="ml-2 text-black">Yes</span>
                </div>
              </div>

              {isERC20 && (
                <>
                  <div className="w-full mb-4 ">
                    <label className="text-left text-gray-700 text-xs mb-1">
                      Token:
                    </label>
                    <div className="flex flex-row gap-2">
                      <input
                        type="text"
                        name="token"
                        placeholder="Enter Token Address"
                        className={`w-full bg-transparent p-3 border rounded-lg text-black ${errorDisplay && errorLoadToken
                          ? "border-red-500"
                          : "border-[#2d2d2d]"
                          }`}
                        value={transaction.token || ""}
                        onChange={handleInputChange}
                      />
                      {isLoadingToken ? (
                        <button className="flex items-center justify-center w-full bg-black text-white rounded-lg p-2 mt-2">
                          <LoadingSpinner />
                          Loading...
                        </button>
                      ) : (
                        <button
                          onClick={loadTokenDetails}
                          className="secondaryButton max-w-max bg-black text-white rounded-lg p-2 mt-2"
                          type="button"
                        >
                          Load Token
                        </button>
                      )}
                    </div>
                    {errorDisplay && errorLoadToken && (
                      <span className="text-red-600 text-left mt-2 text-sm">
                        *{errorLoadToken}
                      </span>
                    )}
                  </div>
                </>
              )}

              {transaction.token && tokenDetails.name && (
                <>
                  <label className="text-left text-gray-700 text-xs mb-1">
                    Token Details:
                  </label>

                  <div className="token-details text-left flex flex-col px-4 border border-[#2d2d2d] mb-4 rounded-lg">
                    <span className="text-slate-600 text-base my-4">
                      Name:{" "}
                      <span className="text-black text-xl font-bold">
                        {tokenDetails.name}
                      </span>
                    </span>
                    <span className="text-slate-600 text-base my-4">
                      Symbol:{" "}
                      <span className="text-black text-xl font-bold">
                        {tokenDetails.symbol}
                      </span>
                    </span>
                    <span className="text-slate-600 text-base my-4">
                      Total Balance:{" "}
                      <span className="text-black text-xl font-bold">
                        {tokenDetails.balance
                          ? `${formatUnits(
                            tokenDetails.balance,
                            tokenDetails.decimals
                              ? parseInt(tokenDetails.decimals)
                              : 18
                          )} ${tokenDetails.symbol}`
                          : null}
                      </span>
                    </span>
                  </div>
                </>
              )}

              <div className="w-full mb-4 ">
                <label className="text-left text-gray-700 text-xs mb-1">
                  Amount:
                </label>
                <input
                  type="text"
                  name="amount"
                  placeholder="Enter Amount"
                  className={`w-full bg-transparent p-3 border rounded-lg text-black ${errorDisplay && errors?.amount
                    ? "border-red-500"
                    : "border-[#2d2d2d]"
                    }`}
                  value={transaction.amount || ""}
                  onChange={handleInputChange}
                />
                {errorDisplay && errors?.amount && (
                  <span className="text-red-600 text-left mt-2 text-sm">
                    *{errors.amount}
                  </span>
                )}
              </div>
              <div className="w-full mb-4 ">
                <label className="self-left text-gray-700 text-xs mb-1">
                  Secret Pin
                </label>
                <input
                  type="number"
                  name="secretpin"
                  placeholder="Enter Secret Pin"
                  className={`w-full bg-transparent p-3 border rounded-lg text-black ${errorDisplay && errors?.secretpin
                    ? "border-red-500"
                    : "border-[#2d2d2d]"
                    }`}
                  value={secretPin || ""}
                  onChange={(e) => setSecretPin(e.target.valueAsNumber)}
                />
                {errorDisplay && errors?.secretpin && (
                  <span className="text-red-600 text-left mt-2 text-sm">
                    *{errors.secretpin}
                  </span>
                )}
              </div>
              <ToastContainer />

              <div className="w-full mt-4 ">
                {isLoading ? (
                  <button className="flex items-center justify-center w-full bg-black text-white rounded-lg p-2 disabled:opacity-80 cursor-not-allowed">
                    <LoadingSpinner /> Sending Request...
                  </button>
                ) : (
                  <button
                    className="customButton w-full bg-black text-white rounded-lg p-2"
                    type="submit"
                  >
                    Send
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
export default InitiateTransaction;
