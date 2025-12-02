# 📂 Views Directory

The `views/` directory contains all the **EJS (Embedded JavaScript)** templates used to render the frontend of the NovaBank application. These templates are server-side rendered by Express.js.

## 🏗️ Structure & Key Files

### 🔐 Authentication
- **`index.ejs`**: The landing page of the application.
- **`login.ejs`**: Manager login page.
- **`signup.ejs`**: Manager registration page.
- **`employeeLogin.ejs`**: Dedicated login portal for employees.

### 👨‍💼 Manager Portal
- **`manager.ejs`**: The main dashboard for Managers. Displays overview stats (total employees, salary, etc.) and list of employees.
- **`addEmployeeForm.ejs`**: Form to onboard a new employee (Cashier, Clerk, etc.).
- **`employee.ejs`**: A list view of all employees (Manager view).
- **`viewEmployee.ejs`**: Detailed profile view of a specific employee.
- **`reports.ejs`**: Visual reports and statistics for the Manager.

### 🧑‍💻 Employee Portal
- **`employeeDashboard.ejs`**: The main workspace for Employees.
- **`addCustomer.ejs`**: Form to create a new bank account for a customer.
- **`viewCustomer.ejs`**: Search interface to find and view customer details.
- **`editCustomer.ejs`**: Interface to update customer information or close accounts.
- **`transactions.ejs`**: The core banking interface for processing Deposits, Withdrawals, and Transfers.
- **`employeeReports.ejs`**: Transaction history and daily activity logs for the employee.

## 🎨 Styling
All views share common styles defined in `public/styles.css` (if applicable) or inline styles/CDN links (e.g., Bootstrap, Tailwind) included in the `<head>` of these templates.
