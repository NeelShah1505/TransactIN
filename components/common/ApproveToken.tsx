"use client";

import {
  createPublicClient,
  http,
  PublicClient,
  WalletClient,
  Hash,
  Address,
} from "viem";
import erc20Abi from "@/contract/ERC20ABI.json";
import { createWalletClient, custom } from "viem";
import { arbitrumSepolia } from "viem/chains";

const publicClient: PublicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(""), // Passing RPC URL to http function
});

let walletClient: WalletClient | undefined;
if (typeof window !== "undefined" && window.ethereum) {
  walletClient = createWalletClient({
    chain: arbitrumSepolia,
    transport: custom(window.ethereum),
  });
}

interface ApprovalResult {
  success: boolean;
  message: string;
}

export const approveToken = async (
  amount: bigint,
  tokenContractAddress: Address,
  address: Address
): Promise<ApprovalResult> => {
  // First, read the current allowance
  const allowance = await readAllowance(tokenContractAddress, address);
  console.log(allowance);

  // Check if the current allowance is sufficient
  if (allowance >= amount) {
    // Already approved for the desired amount, return success
    return { success: true, message: `Already approved ${amount} tokens` };
  }

  // If not enough allowance, proceed to approve
  const { request } = await publicClient.simulateContract({
    account: address,
    address: tokenContractAddress,
    abi: erc20Abi.abi,
    functionName: "approve",
    args: ["0x1302017D2d3aA9Fe213cd7F9fa76d9299722690E" as Address, amount],
  });

  if (!walletClient) {
    throw new Error("Wallet client is not initialized");
  }

  const execute = await walletClient.writeContract(request);
  console.log(execute);

  if (execute) {
    await publicClient.waitForTransactionReceipt({ hash: execute });
  } else {
    throw new Error("Transaction hash is undefined");
  }
  console.log("hello");

  // Handle the execution result if needed
  if (execute) {
    return { success: true, message: `Approved ${amount} tokens successfully` };
  } else {
    return { success: false, message: `Approval failed` };
  }
};

// Helper function to read allowance
const readAllowance = async (
  tokenContractAddress: Address,
  ownerAddress: Address
): Promise<bigint> => {
  const { result } = await publicClient.simulateContract({
    account: ownerAddress,
    address: tokenContractAddress,
    abi: erc20Abi.abi,
    functionName: "allowance",
    args: [
      ownerAddress,
      "0x1302017D2d3aA9Fe213cd7F9fa76d9299722690E" as Address,
    ],
  });

  return result as bigint;
};
