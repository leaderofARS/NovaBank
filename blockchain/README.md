# NovaBank Blockchain Module 🛡️

This directory contains the **Ethereum Blockchain** integration for NovaBank. It is responsible for deploying the Smart Contracts that act as the "Digital Notary" for the banking application.

## 📂 Structure

- **`contracts/`**: Contains the Solidity Smart Contracts.
  - `SecureAuditLog.sol`: The main contract for logging transaction hashes. It includes Role-Based Access Control (RBAC) to ensure only authorized "Notaries" (the backend server) can log data.
- **`scripts/`**: Deployment scripts.
  - `deploy_secure.js`: Deploys the `SecureAuditLog` contract to the local Hardhat network.
- **`hardhat.config.js`**: Configuration for the Hardhat development environment.

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Blockchain
Start a local Ethereum node (Hardhat Network):
```bash
npx hardhat node
```
*Keep this terminal running. It simulates the blockchain network.*

### 3. Deploy Contract
In a separate terminal, deploy the smart contract:
```bash
npx hardhat run scripts/deploy_secure.js --network localhost
```
This will:
1.  Compile the contracts.
2.  Deploy `SecureAuditLog` to the local network.
3.  Generate a `deployed_secure_contract.json` file in this directory, which the main backend server reads to know where to send transactions.

## 🧪 Testing
To run the smart contract tests (if available):
```bash
npx hardhat test
```
