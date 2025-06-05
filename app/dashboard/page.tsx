 'use client'
import TransactionAccordion, { Transaction } from "@/components/common/TransactionAccordian";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Address } from "viem";
import Header from "@/components/header/Header";

interface Attestation {
  attestationId: string;
  attester: string;
  attestTimestamp: number;
  linkedAttestation: string | null;
  chainId: string;
  chainType: "offchain" | "onchain";
  data: string;
  dataLocation: string;
  transactionHash: string;
  revokeTransactionHash: string | null;
  id: string;
  indexingValue: string;
  mode: "offchain" | "onchain";
  recipients: string[];
  revoked: boolean;
  revokeReason: string | null;
  revokeTimestamp: number | null;
  schema: {
    id: string;
    name: string;
    registrant: string;
  };
  validUntil: number;
}

const fetchAttestationDetails = async (attestationId: string | undefined): Promise<Attestation | null> => {
  const query = `
    query getAttestation {
      attestation(id: "${attestationId}") {
        attestationId
        attester
        attestTimestamp
        linkedAttestation
        chainId
        chainType
        data
        dataLocation
        transactionHash
        revokeTransactionHash
        id
        indexingValue
        mode
        recipients
        revoked
        revokeReason
        revokeTimestamp
        schema {
          id
          name
          registrant
        }
        validUntil
      }
    }
  `;
  const response = await fetch("https://testnet-rpc.sign.global/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const result = await response.json();
  return result.data?.attestation ?? null;
};

const fetchTransactions = async (address: string) => {
  if (!address) return [];

  const url = `/api/fetch-transaction?address=${address}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Failed to fetch transactions, response not OK");
      return [];
    }

    const data: Transaction[] = await response.json();
    console.log("Raw transaction data:", data);

    if (!data.length) {
      console.warn("No transactions found for the given address");
      return [];
    }

    const transactionsWithAttestation = await Promise.all(
      data.map(async (transaction: Transaction) => {
        const attestation = await fetchAttestationDetails(transaction.attestationId);
        return { ...transaction, attestation };
      })
    );
    console.log("Transactions with attestation data:", transactionsWithAttestation);
    return transactionsWithAttestation;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return [];
  }
};

const Dashboard: React.FC = () => {
  const { address } = useAccount();
  const [transactions, setTransaction] = useState([]);

  useEffect(() => {
    if (!address) {
      console.log("Address is undefined, skipping transaction fetch.");
      return;
    }

    const loadTransactions = async () => {
      const transactionData: any = await fetchTransactions(address as Address);
      setTransaction(transactionData);
    };

    loadTransactions();
  }, [address]);

  return (
    <>
      <Header />
      <div className="bg-gradient-to-br from-pink-50 to-white min-h-screen pt-20 pb-10">
        <h1 className="mx-6 mb-6 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-pink-500">
          All Transactions
        </h1>
        <main className="mx-6">
          <TransactionAccordion transactions={transactions} />
        </main>
      </div>
    </>
  );
};

export default Dashboard;
