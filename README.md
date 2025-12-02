# NovaBank 🏦

NovaBank is a comprehensive, enterprise-grade banking application designed to streamline operations for managers and employees while ensuring maximum security through **Blockchain technology**.

It combines a traditional **PostgreSQL** database for fast, efficient banking operations with an **Ethereum-based Immutable Audit Trail** to prevent fraud and data tampering.

## 🚀 Features

### 🛡️ Blockchain Security (New!)
- **Immutable Audit Trail:** Every transaction (Deposit, Withdraw, Transfer) is cryptographically hashed and stored on the blockchain.
- **Tamper-Proof History:** Uses **Hash Chaining** (`NewHash = SHA256(Data + PrevHash)`). If a malicious actor alters a record in the SQL database, the cryptographic chain breaks, instantly flagging the corruption.
- **Role-Based Access Control (RBAC):** Only authorized "Notary" nodes can log transactions to the smart contract.

### 👨‍💼 Manager Portal
- **Authentication:** Secure Signup and Login.
- **Dashboard:** Real-time analytics on workforce, total salaries, and role distribution.
- **Employee Management:** Onboard, view, edit, and offboard staff (Cashiers, Clerks, etc.).
- **Reports:** Generate financial and workforce reports.

### 🧑‍💻 Employee Portal
- **Customer Management:**
  - **KYC & Onboarding:** Create accounts with detailed personal info and initial balance checks.
  - **Search & View:** Find customers by Account Number or Name.
  - **Account Management:** Update details or close accounts.
- **Transactions:**
  - **Core Banking:** Process Deposits, Withdrawals, and Transfers.
  - **Validation:** Real-time balance checks and account verification.
- **Daily Reports:** View personal transaction logs and daily activity.

## 🏗️ Hybrid Architecture

NovaBank uses a **Hybrid Database Model** to balance speed and security:

1.  **Primary Data (PostgreSQL):** Stores user details, balances, and transaction logs for high-speed querying and application logic.
2.  **Security Layer (Ethereum Blockchain):** Stores a **SHA-256 Hash** of every transaction. This acts as a "Digital Notary" that proves the integrity of the database.

## 🛠️ Tech Stack

### Backend & Database
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Templating:** EJS (Embedded JavaScript)
- **Authentication:** bcrypt, express-session

### Blockchain & Security
- **Network:** Ethereum (Local Hardhat Network / Testnet)
- **Smart Contracts:** Solidity (v0.8.24)
- **Development Env:** Hardhat
- **Interaction:** Ethers.js
- **Security Standards:** OpenZeppelin (RBAC, Pausable)

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)

## 📂 Folder Structure

```
NovaBank/
├── blockchain/         # Smart Contracts & Hardhat Environment
│   ├── contracts/      # Solidity Contracts (AuditLog.sol, SecureAuditLog.sol)
│   ├── scripts/        # Deployment scripts
│   └── hardhat.config.js
├── public/             # Static assets (CSS, Images, JS)
├── views/              # EJS Templates (Frontend UI)
├── server.js           # Main Application Logic
├── package.json        # Node.js Dependencies
└── README.md           # Project Documentation
```

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [PostgreSQL](https://www.postgresql.org/)
- [Git](https://git-scm.com/)

## 📥 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/leaderofARS/NovaBank.git
cd NovaBank
```

### 2. Install Dependencies
**Root (Backend):**
```bash
npm install
```
**Blockchain Module:**
```bash
cd blockchain
npm install
cd ..
```

### 3. Configure Environment
Create a `.env` file in the root directory:
```env
PORT=3000
PG_USER=your_postgres_user
PG_HOST=localhost
PG_DB=your_database_name
PG_PASS=your_postgres_password
PG_PORT=5432
```

### 4. Database Setup
Run the following SQL commands in PostgreSQL to set up the tables:

```sql
-- Managers
CREATE TABLE managers (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Employees
CREATE TABLE employees_credentials (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    salary NUMERIC(10, 2) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Customers
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    account_no VARCHAR(20) UNIQUE NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    dob DATE,
    parents_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    aadhar VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    account_type VARCHAR(50),
    balance NUMERIC(15, 2) DEFAULT 0.00
);

-- Transactions
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    account_no VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    balance NUMERIC(15, 2) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Start the Blockchain (Required for Security Features)
Open a **new terminal** window:
```bash
cd blockchain
npx hardhat node
```
*Keep this terminal running.*

Open **another terminal** to deploy the secure contract:
```bash
cd blockchain
npx hardhat run scripts/deploy_secure.js --network localhost
```
*This generates `deployed_secure_contract.json` which the backend uses.*

### 6. Run the Application
In your main terminal (root folder):
```bash
npm start
# OR
npm run dev
```

Visit `http://localhost:3000` in your browser.

## 🛡️ Usage Guide

1.  **Manager Access:**
    - Go to `/signup` to create a manager account.
    - Login at `/login` to manage employees.

2.  **Employee Access:**
    - Login at `/employee-login` using credentials provided by a Manager.
    - Perform transactions. **Every transaction will now be automatically hashed and logged to your local blockchain.**

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

This project is licensed under the ISC License.