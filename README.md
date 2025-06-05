# 🛡️ TransactIN — Secure, Cross-Chain Token Transfers

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Powered by Chainlink](https://img.shields.io/badge/Powered%20by-Chainlink-blue.svg)](https://chain.link)
[![Built With ❤️](https://img.shields.io/badge/Built%20With-%E2%9D%A4-red.svg)](#)

> **“There’s no undo button on the blockchain. So we built one with trust.”**

## 🚀 Overview

Have you ever felt paranoid before transferring tokens—double-checking every single character in the address?

**TransactIN** is here to fix that. It's a secure, EIP-712 based decentralized payment protocol that ensures **both sender and recipient sign** off on a transaction before tokens move—so funds go exactly where they're supposed to.

And the best part? **Gas fees can be sponsored by anyone**—truly enabling **gasless** and user-friendly token transfers.

---

## 🔐 Key Features

- ✅ **EIP-712 Dual Signatures**: Mutual verification by both sender and recipient before any funds are moved.
- 🔁 **Cross-Chain Transfers**: Powered by **Chainlink CCIP** and **Circle CCTP** for seamless token movement between chains.
- 🧾 **On-chain Verification**: All signatures are verified on-chain before transaction execution.
- 🪙 **Gas Fee Sponsorship**: Anyone can pay gas fees (yes, even a third party).
- 🧠 **Attestation Protocol**: Integrates with **Sign Protocol** to record, index, and validate all actions.
- 🔍 **Real-Time Indexing**: Uses **The Graph** to index attestation data for full transparency.

---

## ⚙️ How It Works

### 1. **Sender Signs**
A user initiates a token transfer and signs the message via **EIP-712**, producing a structured, verifiable payload.

### 2. **Recipient Attests**
The recipient verifies and signs their agreement, creating a second, binding attestation to the same transfer.

### 3. **Execution**
Once both signatures are verified on-chain, the transfer is executed. The executor can be **any third party**, even a relayer, enabling **gasless transfers**.

---

## 🔗 Cross-Chain Support

- 🔄 **Chainlink CCIP** enables cross-chain token transfers.
- 💸 **Circle CCTP** facilitates secure USDC movement across blockchains.
- 🔍 **The Graph** fetches attestation data in real time.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|------------|
| 🔐 Signatures | [EIP-712](https://eips.ethereum.org/EIPS/eip-712), Sign Protocol |
| 🔗 Cross-Chain | Chainlink CCIP, Circle CCTP |
| 🛠 Indexing | The Graph |
| ⚙️ Smart Contracts | Solidity (v0.8+) |
| 🔧 Tooling | Hardhat / Foundry, Ethers.js, Web3Modal |
| 🌐 Frontend | Next.js / React.js |

---

📦 Deployment & Transaction Details

Deployed on Arbitrum Sepolia
Transaction Hash: 0x653ae225bd06408ebb83ecaa7d2f1292af28649a5ae6935bb97ec68c1a4a498a

Deployed on Sepolia
Transaction Hash: 0x0e1bc9b0ccc9f0718a43f503c2d3d032b2e3232f88edf368fc11e42487f551d4

## 🛠️ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/transactin.git
cd transactin

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run local dev node
npx hardhat node

# Deploy contracts to localhost
npx hardhat run scripts/deploy.js --network localhost
