# NovaBank Views 🎨

This directory contains the **EJS (Embedded JavaScript)** templates for the frontend of the NovaBank application. These templates are rendered by the Express.js server and sent to the client's browser.

## 📂 Structure

### 🏠 Public Pages
- **`index.ejs`**: The landing page of the application.
- **`login.ejs`**: Manager login page.
- **`signup.ejs`**: Manager signup page.
- **`employeeLogin.ejs`**: Employee login page.

### 👨‍💼 Manager Portal
- **`manager.ejs`**: The main dashboard for Bank Managers. Displays real-time stats and employee lists.
- **`addEmployeeForm.ejs`**: Form to onboard new employees.
- **`employee.ejs`**: List view of all employees.
- **`viewEmployee.ejs`**: Detailed view of a specific employee.
- **`reports.ejs`**: Generates reports for the manager.

### 🧑‍💻 Employee Portal
- **`employeeDashboard.ejs`**: The main dashboard for Bank Employees. Shows personal stats and quick actions.
- **`addCustomer.ejs`**: Form to KYC and onboard new customers.
- **`viewCustomer.ejs`**: Search interface to find customers by Account Number.
- **`editCustomer.ejs`**: Interface to update customer details.
- **`transactions.ejs`**: Core banking interface for Deposits, Withdrawals, and Transfers.
- **`employeeReports.ejs`**: Transaction history and daily activity reports for the employee.

## 🎨 Styling
Most styles are embedded within the `<style>` tags of each EJS file or linked from the `public/` directory. The design focuses on a modern, clean aesthetic using standard CSS and FontAwesome icons.
