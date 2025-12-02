# NovaBank 🏦

NovaBank is a comprehensive web-based banking application designed to streamline banking operations for managers and employees. It provides a secure and efficient platform for managing staff, customers, and financial transactions.

## 🚀 Features

### 👨‍💼 Manager Portal
- **Authentication:** Secure Signup and Login for Managers.
- **Dashboard:** Real-time overview of total employees, total salary distribution, and role-based statistics.
- **Employee Management:**
  - **Add Employee:** Onboard new staff with details like role, salary, and credentials.
  - **View Employees:** List all employees with their details.
  - **Edit/Delete Employee:** Update employee information or remove access.
- **Reports:** Generate reports on workforce distribution and financial metrics.

### 🧑‍💻 Employee Portal
- **Authentication:** Secure Login for Employees (Cashiers, Clerks, etc.).
- **Customer Management:**
  - **Add Customer:** Create new bank accounts with comprehensive details (KYC, Account Type, Initial Balance).
  - **View Customer:** Search and view customer details by Account Number or Name.
  - **Edit/Delete Customer:** Update customer information or close accounts.
- **Transactions:**
  - **Deposit:** Add funds to customer accounts.
  - **Withdraw:** Deduct funds with balance validation.
  - **Transfer:** Secure money transfer between accounts.
- **Transaction Reports:** View transaction history and daily activity logs.

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Templating Engine:** EJS
- **Authentication:** bcrypt (Password Hashing), express-session (Session Management)
- **Frontend:** HTML, CSS, JavaScript

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [PostgreSQL](https://www.postgresql.org/)

## 📥 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/leaderofARS/NovaBank.git
cd NovaBank
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and add your PostgreSQL database configuration:

```env
PORT=3000
PG_USER=your_postgres_user
PG_HOST=localhost
PG_DB=your_database_name
PG_PASS=your_postgres_password
PG_PORT=5432
```

### 4. Database Setup
You need to create the necessary tables in your PostgreSQL database. Run the following SQL commands in your database query tool (e.g., pgAdmin, psql):

```sql
-- Create Managers Table
CREATE TABLE managers (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create Employees Table
CREATE TABLE employees_credentials (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    salary NUMERIC(10, 2) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create Customers Table
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

-- Create Transactions Table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    account_no VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL, -- deposit, withdraw, transfer
    amount NUMERIC(15, 2) NOT NULL,
    balance NUMERIC(15, 2) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Run the Application
Start the server:

```bash
npm start
# OR for development with nodemon (if installed)
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🛡️ Usage Guide

1.  **Manager Access:**
    - Go to `/signup` to create a manager account.
    - Login at `/login`.
    - Use the dashboard to add employees.

2.  **Employee Access:**
    - Employees use the credentials created by the Manager.
    - Login at `/employee-login`.
    - Use the dashboard to manage customers and perform transactions.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License

This project is licensed under the ISC License.