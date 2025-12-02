# 🔗 Blockchain Module

This directory contains the **Secure Audit Trail** infrastructure for NovaBank. It uses Ethereum-based Smart Contracts to create an immutable, tamper-proof record of all banking transactions.

## 🏛️ Architecture

We use a **Hybrid Architecture**:
1.  **PostgreSQL**: Stores the actual data (fast, queryable).
2.  **Blockchain**: Stores a **Cryptographic Hash** of the data (immutable, secure).

### 🔐 Key Components

#### 1. Smart Contracts (`contracts/`)
*   **`AuditLog.sol`**: A basic contract to store transaction hashes.
*   **`SecureAuditLog.sol`** (Recommended): An advanced, enterprise-grade contract featuring:
    *   **Role-Based Access Control (RBAC)**: Only authorized "Notaries" (your server) can write data.
    *   **Hash Chaining**: `NewHash = SHA256(Data + PreviousHash)`. This links all transactions for an account together. If one is altered, the chain breaks.
    *   **Pausable**: Emergency stop mechanism.

#### 2. Scripts (`scripts/`)
*   **`deploy.js`**: Deploys the basic `AuditLog` contract.
*   **`deploy_secure.js`**: Deploys the `SecureAuditLog` contract.

#### 3. Configuration
*   **`hardhat.config.js`**: Configures the local blockchain environment (Hardhat Network).

## 🚀 How to Run

### Step 1: Start the Local Blockchain
Open a terminal in this directory and run:
```bash
npx hardhat node
```
*This starts a simulated Ethereum network on your machine at `http://127.0.0.1:8545`.*

### Step 2: Deploy the Contract
In a **separate** terminal (while the node is running), deploy the secure contract:
```bash
npx hardhat run scripts/deploy_secure.js --network localhost
```
This will:
1.  Compile the Solidity code.
2.  Deploy it to your local network.
3.  Generate a `deployed_secure_contract.json` file in the project root (containing the address and ABI for the backend to use).

## 🛠️ Tech Stack
*   **Hardhat**: Development environment.
*   **Solidity**: Smart contract language.
*   **Ethers.js**: Library to interact with the blockchain.
*   **OpenZeppelin**: Industry-standard security libraries.
