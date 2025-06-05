import { createPublicClient, http, PublicClient } from "viem";
import { getContract } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { parseAbi } from "viem";

import erc20Abi from "@/contract/ERC20ABI.json";

const publicClient: PublicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

export interface TokenDetails {
  name?: string;
  symbol?: string;
  decimals?: string;
  balance?: bigint;
}

export async function getTokenDetails(
  TokenAddress: string,
  UsersAddress: string
): Promise<TokenDetails | null> {
  try {
    const contract = getContract({
      address: TokenAddress as `0x${string}`,
      abi: erc20Abi.abi,
      client: publicClient,
    });
    console.log(UsersAddress);

    const [name, symbol, decimals, balance] = await Promise.all([
      contract.read.name() as Promise<string>,
      contract.read.symbol() as Promise<string>,
      contract.read.decimals() as Promise<bigint>,
      contract.read.balanceOf([
        UsersAddress as `0x${string}`,
      ]) as Promise<bigint>,
    ]);

    console.log(balance);

    return {
      name,
      symbol,
      decimals: decimals.toString(),
      balance,
    };
  } catch (error) {
    console.log("loading token error", (error as Error).message);
    return null;
  }
}
