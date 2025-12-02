import express from "express"; 
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import session from "express-session";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: "yourSecretKey",
  resave: false,
  saveUninitialized: false
}));
app.set("view engine", "ejs");

// PostgreSQL connection
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DB,
  password: process.env.PG_PASS,
  port: process.env.PG_PORT,
});

db.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ DB connection error:", err));

// Middleware to protect manager routes
function isAuthenticated(req, res, next) {
  if (req.session.managerId) return next();
  res.redirect("/login");
}

// Middleware to protect employee routes
function isEmployee(req, res, next) {
  if (req.session.employee) return next();
  res.redirect("/employee-login");
}

// Root → Landing Page
app.get("/", (req, res) => res.render("index"));

// ---------------- MANAGER ROUTES ---------------- //

// Signup
app.get("/signup", (req, res) => res.render("signup"));

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await db.query(
      "INSERT INTO managers (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashedPassword]
    );
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.send("Error signing up. Maybe email/username already exists.");
  }
});

// Login
app.get("/login", (req, res) => res.render("login"));

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM managers WHERE email=$1", [email]);
    if (result.rows.length === 0) return res.send("Manager not found");

    const manager = result.rows[0];
    const match = await bcrypt.compare(password, manager.password);
    if (match) {
      req.session.managerId = manager.id;
      req.session.managerName = manager.username;
      res.redirect("/manager");
    } else {
      res.send("Incorrect password");
    }
  } catch (err) {
    console.error(err);
    res.send("Error during login");
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send("Error logging out");
    res.redirect("/");
  });
});

// Manager Dashboard
app.get("/manager", isAuthenticated, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM employees_credentials");

    const totalEmployees = result.rows.length;
    const totalSalary = result.rows.reduce((sum, e) => sum + Number(e.salary), 0);

    const totalManagers = result.rows.filter(e => e.role === "Manager").length;
    const totalCashiers = result.rows.filter(e => e.role === "Cashier").length;
    const totalAccountants = result.rows.filter(e => e.role === "Accountant").length;
    const totalClerks = result.rows.filter(e => e.role === "Clerk").length;
    const totalITSupport = result.rows.filter(e => e.role === "IT Support").length;

    res.render("manager", { 
      employees: result.rows,
      managerName: req.session.managerName,

      // IMPORTANT: Add these for EJS
      totalEmployees,
      totalSalary,
      totalManagers,
      totalCashiers,
      totalAccountants,
      totalClerks,
      totalITSupport
    });

  } catch (err) {
    console.error(err);
    res.render("manager", { 
      employees: [],
      managerName: req.session.managerName,
      totalEmployees: 0,
      totalSalary: 0,
      totalManagers: 0,
      totalCashiers: 0,
      totalAccountants: 0,
      totalClerks: 0,
      totalITSupport: 0
    });
  }
});

// Show Add Employee Form
app.get("/add-employee-form", isAuthenticated, (req, res) => {
  res.render("addEmployeeForm", { managerName: req.session.managerName });
});

// Add Employee
app.post("/add-employee", isAuthenticated, async (req, res) => {
  const { username, name, email, role, salary, password } = req.body;
  if (!username || !name || !email || !role || !salary || !password) return res.send("All fields are required");

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO employees_credentials (username, name, email, role, salary, password) VALUES ($1, $2, $3, $4, $5, $6)",
      [username, name, email, role, salary, hashedPassword]
    );
    res.redirect("/manager");
  } catch (err) {
    console.error(err);
    res.send("Error adding employee. Try again later.");
  }
});

// Delete Employee
app.post("/delete-employee/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM employees_credentials WHERE id=$1", [id]);
    res.redirect("/manager");
  } catch (err) {
    console.error(err);
    res.send("Error deleting employee");
  }
});

// Edit Employee
app.post("/edit-employee/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { username, name, email, role, salary, password } = req.body;

  try {
    let query, params;
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = "UPDATE employees_credentials SET username=$1, name=$2, email=$3, role=$4, salary=$5, password=$6 WHERE id=$7";
      params = [username, name, email, role, salary, hashedPassword, id];
    } else {
      query = "UPDATE employees_credentials SET username=$1, name=$2, email=$3, role=$4, salary=$5 WHERE id=$6";
      params = [username, name, email, role, salary, id];
    }
    await db.query(query, params);
    res.redirect("/manager");
  } catch (err) {
    console.error(err);
    res.send("Error updating employee");
  }
});

// View all employees (for manager)
app.get("/employees", isAuthenticated, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM employees_credentials");
    res.render("employee", { employees: result.rows });
  } catch (err) {
    console.error(err);
    res.send("Error fetching employees");
  }
});

// View single employee
app.get("/view-employee/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM employees_credentials WHERE id=$1", [id]);
    if (result.rows.length === 0) return res.send("Employee not found");
    res.render("viewEmployee", { employee: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.send("Error fetching employee details");
  }
});

// Reports Page
app.get("/reports", isAuthenticated, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM employees_credentials");
    const totalEmployees = result.rows.length;
    const totalSalary = result.rows.reduce((sum, e) => sum + parseFloat(e.salary), 0);

    const managers = result.rows.filter(e => e.role === "Manager").length;
    const cashiers = result.rows.filter(e => e.role === "Cashier").length;
    const accountants = result.rows.filter(e => e.role === "Accountant").length;
    const clerks = result.rows.filter(e => e.role === "Clerk").length;
    const itSupport = result.rows.filter(e => e.role === "IT Support").length;

    res.render("reports", { 
      totalEmployees, totalSalary, managers, cashiers, accountants, clerks, itSupport 
    });
  } catch (err) {
    console.error(err);
    res.render("reports", { 
      totalEmployees: 0, totalSalary: 0, managers: 0, cashiers: 0, accountants: 0, clerks: 0, itSupport: 0 
    });
  }
});

// ---------------- EMPLOYEE ROUTES ---------------- //

app.get("/employee-login", (req, res) => res.render("employeeLogin", { error: null }));

app.post("/employee-login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM employees_credentials WHERE username=$1", 
      [username.trim()]
    );

    console.log("Employee search result:", result.rows); // DEBUG

    if (result.rows.length === 0) {
      return res.render("employeeLogin", { error: "Employee not found" });
    }

    const employee = result.rows[0];
    const match = await bcrypt.compare(password, employee.password);

    if (match) {
      req.session.employee = {
        id: employee.id,
        name: employee.name,
        username: employee.username,
        role: employee.role,
        email: employee.email
      };
      return res.redirect("/employee-dashboard");
    } else {
      return res.render("employeeLogin", { error: "Invalid password" });
    }

  } catch (err) {
    console.error("Login error:", err);
    return res.render("employeeLogin", { error: "Error during login. Try again later." });
  }
});


// Employee Dashboard
app.get("/employee-dashboard", isEmployee, (req, res) => {
  res.render("employeeDashboard", { 
    employee: req.session.employee,
    customer: null
  });
});


/// ---------------- ADD CUSTOMER ---------------- //

// GET → Show Add Customer form
app.get("/employee/add-customer", isEmployee, async (req, res) => {
  try {
    res.render("addCustomer", {
      employee: req.session.employee,
      error: null,
      success: null
    });
  } catch (err) {
    console.error("Error rendering add customer page:", err);
    res.send("Error loading Add Customer page");
  }
});

// POST → Add Customer to DB
app.post("/employee/add-customer", isEmployee, async (req, res) => {
  const {
    fullname,
    dob,
    lineage, // parent's name
    email,
    phone,
    aadhar,
    address,
    city,
    state,
    pincode,
    account_type,  // ⬅️ ADD THIS
    balance
  } = req.body;

  const parents_name = lineage;

  try {
    // Minimum balance validation based on account type
    const minBalanceRules = {
      'Savings': 500,
      'Current': 5000,
      'Salary': 0
    };

    const minRequired = minBalanceRules[account_type] || 500;

    if (!balance || parseFloat(balance) < minRequired) {
      return res.render("addCustomer", {
        employee: req.session.employee,
        error: `Initial balance for ${account_type} account should be at least ₹${minRequired}.`,
        success: null
      });
    }

    // Generate new account number
    const lastCustomer = await db.query(
      "SELECT account_no FROM customers ORDER BY customer_id DESC LIMIT 1"
    );

    let newAccountNo = "NOVABANK001";
    if (lastCustomer.rows.length > 0) {
      const lastAcc = lastCustomer.rows[0].account_no;
      const lastNum = parseInt(lastAcc.replace("NOVABANK", "")) + 1;
      newAccountNo = "NOVABANK" + lastNum.toString().padStart(3, "0");
    }

    // Insert customer with account_type
    await db.query(
      `INSERT INTO customers 
      (account_no, fullname, dob, parents_name, email, phone, aadhar, address, city, state, pincode, account_type, balance)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [newAccountNo, fullname, dob, parents_name, email, phone, aadhar, address, city, state, pincode, account_type, balance]
      // ⬅️ Added account_type as $12
    );

    res.render("addCustomer", {
      employee: req.session.employee,
      error: null,
      success: `Customer added successfully! Account Number: ${newAccountNo} | Type: ${account_type}`
    });
  } catch (err) {
    console.error("DB Error:", err);
    res.render("addCustomer", {
      employee: req.session.employee,
      error: "Error adding customer. Please try again.",
      success: null
    });
  }
});

// ---------------- VIEW CUSTOMER ROUTES ---------------- //

// Show search form
app.get("/employee/view-customer", isEmployee, (req, res) => {
  res.render("viewCustomer", { employee: req.session.employee, customer: null, error: null });
});

// Handle search
app.post("/employee/view-customer", isEmployee, async (req, res) => {
  const { account_no, fullname } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM customers WHERE account_no=$1 AND fullname ILIKE $2",
      [account_no, `%${fullname}%`]
    );

    if (result.rows.length === 0) {
      return res.render("viewCustomer", {
        employee: req.session.employee,
        customer: null,
        error: "No customer found with given details."
      });
    }

    res.render("viewCustomer", {
      employee: req.session.employee,
      customer: result.rows[0],
      error: null
    });
  } catch (err) {
    console.error(err);
    res.send("Error fetching customer details");
  }
});


// ---------------- EDIT CUSTOMER PAGE ---------------- //

// Show form to search customer
app.get("/employee/edit-customer", isEmployee, (req, res) => {
  res.render("editCustomer", { customer: null, error: null });
});

// Handle search for customer
app.post("/employee/edit-customer/search", isEmployee, async (req, res) => {
  const { account_no, fullname } = req.body;   // ✅ match DB column names
  try {
    const result = await db.query(
      "SELECT * FROM customers WHERE account_no=$1 AND fullname=$2",
      [account_no, fullname]
    );

    if (result.rows.length === 0) {
      return res.render("editCustomer", {
        customer: null,
        error: "Customer not found. Please check details again.",
      });
    }

    res.render("editCustomer", { customer: result.rows[0], error: null });
  } catch (err) {
    console.error(err);
    res.render("editCustomer", {
      customer: null,
      error: "Error fetching customer.",
    });
  }
});

// Handle update
app.post("/employee/edit-customer/update/:id", isEmployee, async (req, res) => {
  const { fullname, address, phone, email } = req.body; // ✅ correct column names
  const { id } = req.params;

  try {
    await db.query(
      `UPDATE customers
       SET fullname=$1, address=$2, phone=$3, email=$4
       WHERE customer_id=$5`,
      [fullname, address, phone, email, id]
    );
    res.send("Customer details updated successfully!");
  } catch (err) {
    console.error(err);
    res.send("Error updating customer.");
  }
});

// Handle delete
app.post("/employee/edit-customer/delete/:id", isEmployee, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM customers WHERE customer_id=$1", [id]);
    res.send("Customer deleted successfully!");
  } catch (err) {
    console.error(err);
    res.send("Error deleting customer.");
  }
});



// ============================================================
// EMPLOYEE REPORTS ROUTES
// ============================================================

app.get("/employee/reports", isEmployee, async (req, res) => {
  try {
    // Get all transactions
    const allTransactionsResult = await db.query(
      "SELECT * FROM transactions ORDER BY date DESC"
    );

    // Get today's transactions
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const todayResult = await db.query(
      "SELECT * FROM transactions WHERE date >= $1 AND date <= $2 ORDER BY date DESC",
      [startOfDay, endOfDay]
    );

    // Format transactions
    const transactions = allTransactionsResult.rows.map(tx => ({
      date: new Date(tx.date).toLocaleString('en-IN'),
      account_no: tx.account_no,
      type: tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
      amount: parseFloat(tx.amount).toFixed(2),
      balance: parseFloat(tx.balance).toFixed(2)
    }));

    const todayTransactions = todayResult.rows.map(tx => ({
      date: new Date(tx.date).toLocaleString('en-IN'),
      account_no: tx.account_no,
      type: tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
      amount: parseFloat(tx.amount).toFixed(2),
      balance: parseFloat(tx.balance).toFixed(2)
    }));

    // Calculate stats
    const stats = {
      totalTransactions: allTransactionsResult.rows.length,
      todayTransactionsCount: todayResult.rows.length
    };

    res.render("employeeReports", {
      employee: req.session.employee,
      transactions: transactions,
      todayTransactions: todayTransactions,
      stats: stats
    });

  } catch (err) {
    console.error("Employee reports error:", err);
    res.render("employeeReports", {
      employee: req.session.employee,
      transactions: [],
      todayTransactions: [],
      stats: {
        totalTransactions: 0,
        todayTransactionsCount: 0
      }
    });
  }
});


// ============================================================
// TRANSACTION ROUTES
// ============================================================

// GET - Show transaction form
app.get("/employee/transactions", isEmployee, async (req, res) => {
  try {
    // Load list of recent customers for reference
    const customersResult = await db.query(
      "SELECT account_no, fullname FROM customers ORDER BY customer_id DESC LIMIT 20"
    );
    
    res.render("transactions", { 
      employee: req.session.employee,
      result: null,
      error: null,
      recentAccounts: customersResult.rows
    });
  } catch (err) {
    console.error("Error loading transactions page:", err);
    res.render("transactions", { 
      employee: req.session.employee,
      result: null,
      error: null,
      recentAccounts: []
    });
  }
});

// POST - Process transaction
app.post("/employee/transactions", isEmployee, async (req, res) => {
  const { type, account_no, amount, to_account } = req.body;

  // Helper function to validate and sanitize account numbers
  function isValidAccountNo(accountNo) {
    // Allow alphanumeric, basic account number format
    return /^[A-Za-z0-9]{1,20}$/.test(accountNo);
  }

  // Validation
  if (!type || !account_no || !amount) {
    return res.render("transactions", {
      employee: req.session.employee,
      result: null,
      error: "All fields are required!",
      recentAccounts: []
    });
  }

  // Validate account number format
  if (!isValidAccountNo(account_no.trim())) {
    return res.render("transactions", {
      employee: req.session.employee,
      result: null,
      error: "Invalid account number format!",
      recentAccounts: []
    });
  }

  // Validate transfer recipient account format
  if (type === "transfer" && to_account && !isValidAccountNo(to_account.trim())) {
    return res.render("transactions", {
      employee: req.session.employee,
      result: null,
      error: "Invalid recipient account number format!",
      recentAccounts: []
    });
  }

  const amountNum = parseFloat(amount);
  if (amountNum <= 0) {
    return res.render("transactions", {
      employee: req.session.employee,
      result: null,
      error: "Amount must be greater than zero!",
      recentAccounts: []
    });
  }

  try {
    
    // ==========================
    // DEPOSIT
    // ==========================
    if (type === "deposit") {
      // Fetch customer
      const customerResult = await db.query(
        "SELECT * FROM customers WHERE account_no=$1",
        [account_no]
      );

      if (customerResult.rows.length === 0) {
        return res.render("transactions", {
          employee: req.session.employee,
          result: null,
          error: "Customer account not found!"
        });
      }

      const customer = customerResult.rows[0];
      const oldBalance = parseFloat(customer.balance);
      const newBalance = oldBalance + amountNum;

      // Update balance
      await db.query(
        "UPDATE customers SET balance=$1 WHERE account_no=$2",
        [newBalance, account_no]
      );

      // Record transaction
      const txResult = await db.query(
        "INSERT INTO transactions (account_no, type, amount, balance) VALUES ($1, $2, $3, $4) RETURNING id, date",
        [account_no, "deposit", amountNum, newBalance]
      );

      const transaction = txResult.rows[0];

      // Prepare result object
      const result = {
        success: true,
        transactionId: `TXN${transaction.id}`,
        transactionDate: new Date(transaction.date).toLocaleString('en-IN'),
        type: "deposit",
        amount: amountNum,
        account: {
          account_no: customer.account_no,
          fullname: customer.fullname,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          oldBalance: oldBalance,
          newBalance: newBalance
        }
      };

      return res.render("transactions", {
        employee: req.session.employee,
        result: result,
        error: null,
        recentAccounts: []
      });
    }

    // ==========================
    // WITHDRAW
    // ==========================
    if (type === "withdraw") {
      // Fetch customer
      const customerResult = await db.query(
        "SELECT * FROM customers WHERE account_no=$1",
        [account_no]
      );

      if (customerResult.rows.length === 0) {
        return res.render("transactions", {
          employee: req.session.employee,
          result: null,
          error: "Customer account not found!"
        });
      }

      const customer = customerResult.rows[0];
      const oldBalance = parseFloat(customer.balance);

      // Check sufficient balance
      if (oldBalance < amountNum) {
        return res.render("transactions", {
          employee: req.session.employee,
          result: null,
          error: `Insufficient balance! Current balance: ₹${oldBalance.toLocaleString()}`,
          recentAccounts: []
        });
      }

      const newBalance = oldBalance - amountNum;

      // Update balance
      await db.query(
        "UPDATE customers SET balance=$1 WHERE account_no=$2",
        [newBalance, account_no]
      );

      // Record transaction
      const txResult = await db.query(
        "INSERT INTO transactions (account_no, type, amount, balance) VALUES ($1, $2, $3, $4) RETURNING id, date",
        [account_no, "withdraw", amountNum, newBalance]
      );

      const transaction = txResult.rows[0];

      // Prepare result object
      const result = {
        success: true,
        transactionId: `TXN${transaction.id}`,
        transactionDate: new Date(transaction.date).toLocaleString('en-IN'),
        type: "withdraw",
        amount: amountNum,
        account: {
          account_no: customer.account_no,
          fullname: customer.fullname,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          oldBalance: oldBalance,
          newBalance: newBalance
        }
      };

      return res.render("transactions", {
        employee: req.session.employee,
        result: result,
        error: null,
        recentAccounts: []
      });
    }

    // ==========================
    // TRANSFER
    // ==========================
    if (type === "transfer") {
      // Validate to_account
      if (!to_account || to_account.trim() === "") {
        return res.render("transactions", {
          employee: req.session.employee,
          result: null,
          error: "Recipient account number is required for transfer!"
        });
      }

      // Check if sender and receiver are same
      if (account_no === to_account) {
        return res.render("transactions", {
          employee: req.session.employee,
          result: null,
          error: "Cannot transfer to the same account!"
        });
      }

      // Fetch SENDER
      const senderResult = await db.query(
        "SELECT * FROM customers WHERE account_no=$1",
        [account_no]
      );

      if (senderResult.rows.length === 0) {
        return res.render("transactions", {
          employee: req.session.employee,
          result: null,
          error: "Sender account not found!"
        });
      }

      // Fetch RECEIVER
      const receiverResult = await db.query(
        "SELECT * FROM customers WHERE account_no=$1",
        [to_account]
      );

      if (receiverResult.rows.length === 0) {
        return res.render("transactions", {
          employee: req.session.employee,
          result: null,
          error: "Recipient account not found!"
        });
      }

      const sender = senderResult.rows[0];
      const receiver = receiverResult.rows[0];

      const senderOldBalance = parseFloat(sender.balance);
      const receiverOldBalance = parseFloat(receiver.balance);

      // Check sufficient balance
      if (senderOldBalance < amountNum) {
        return res.render("transactions", {
          employee: req.session.employee,
          result: null,
          error: `Insufficient balance in sender account! Current balance: ₹${senderOldBalance.toLocaleString()}`
        });
      }

      const senderNewBalance = senderOldBalance - amountNum;
      const receiverNewBalance = receiverOldBalance + amountNum;

      // Update SENDER balance
      await db.query(
        "UPDATE customers SET balance=$1 WHERE account_no=$2",
        [senderNewBalance, account_no]
      );

      // Update RECEIVER balance
      await db.query(
        "UPDATE customers SET balance=$1 WHERE account_no=$2",
        [receiverNewBalance, to_account]
      );

      // Record SENDER transaction
      const senderTxResult = await db.query(
        "INSERT INTO transactions (account_no, type, amount, balance, to_account) VALUES ($1, $2, $3, $4, $5) RETURNING id, date",
        [account_no, "transfer", amountNum, senderNewBalance, to_account]
      );

      // Record RECEIVER transaction
      await db.query(
        "INSERT INTO transactions (account_no, type, amount, balance, to_account) VALUES ($1, $2, $3, $4, $5)",
        [to_account, "transfer", amountNum, receiverNewBalance, account_no]
      );

      const transaction = senderTxResult.rows[0];

      // Prepare result object
      const result = {
        success: true,
        transactionId: `TXN${transaction.id}`,
        transactionDate: new Date(transaction.date).toLocaleString('en-IN'),
        type: "transfer",
        amount: amountNum,
        sender: {
          account_no: sender.account_no,
          fullname: sender.fullname,
          email: sender.email,
          phone: sender.phone,
          address: sender.address,
          oldBalance: senderOldBalance,
          newBalance: senderNewBalance
        },
        receiver: {
          account_no: receiver.account_no,
          fullname: receiver.fullname,
          email: receiver.email,
          phone: receiver.phone,
          address: receiver.address,
          oldBalance: receiverOldBalance,
          newBalance: receiverNewBalance
        }
      };

      return res.render("transactions", {
        employee: req.session.employee,
        result: result,
        error: null,
        recentAccounts: []
      });
    }

    // Invalid transaction type
    return res.render("transactions", {
      employee: req.session.employee,
      result: null,
      error: "Invalid transaction type!",
      recentAccounts: []
    });

  } catch (err) {
    console.error("Transaction error:", err);
    return res.render("transactions", {
      employee: req.session.employee,
      result: null,
      error: "Database error occurred. Please try again.",
      recentAccounts: []
    });
  }
});


// ============================================================
// DAILY REPORT ROUTES
// ============================================================

app.get("/employee/daily-report", isEmployee, async (req, res) => {
  try {
    // Get today's date boundaries (IST timezone)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Total transactions count
    const totalResult = await db.query(
      "SELECT COUNT(*) as count FROM transactions WHERE date >= $1 AND date <= $2",
      [startOfDay, endOfDay]
    );

    // Total deposits
    const depositsResult = await db.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type='deposit' AND date >= $1 AND date <= $2",
      [startOfDay, endOfDay]
    );

    // Total withdrawals
    const withdrawalsResult = await db.query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type='withdraw' AND date >= $1 AND date <= $2",
      [startOfDay, endOfDay]
    );

    const report = {
      totalTransactions: parseInt(totalResult.rows[0].count),
      totalDeposits: parseFloat(depositsResult.rows[0].total).toFixed(2),
      totalWithdrawals: parseFloat(withdrawalsResult.rows[0].total).toFixed(2)
    };

    res.render("dailyReport", { 
      employee: req.session.employee,
      report: report 
    });

  } catch (err) {
    console.error("Daily report error:", err);
    res.render("dailyReport", { 
      employee: req.session.employee,
      report: {
        totalTransactions: 0,
        totalDeposits: 0,
        totalWithdrawals: 0
      }
    });
  }
});


// ============================================================
// STATEMENT ROUTES
// ============================================================

// GET - Show search form
app.get("/employee/statement", isEmployee, (req, res) => {
  res.render("statementSearch", { 
    employee: req.session.employee,
    error: null
  });
});

// POST - Fetch and display statement
app.post("/employee/statement", isEmployee, async (req, res) => {
  const { account_no } = req.body;

  if (!account_no || account_no.trim() === "") {
    return res.render("statementSearch", {
      employee: req.session.employee,
      error: "Account number is required!"
    });
  }

  try {
    // Check if customer exists
    const customerResult = await db.query(
      "SELECT * FROM customers WHERE account_no=$1",
      [account_no]
    );

    if (customerResult.rows.length === 0) {
      return res.render("statementSearch", {
        employee: req.session.employee,
        error: "Customer account not found!"
      });
    }

    // Fetch transactions
    const transactionsResult = await db.query(
      "SELECT * FROM transactions WHERE account_no=$1 ORDER BY date DESC",
      [account_no]
    );

    // Format transactions
    const transactions = transactionsResult.rows.map(tx => ({
      date: new Date(tx.date).toLocaleString('en-IN'),
      type: tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
      amount: parseFloat(tx.amount).toFixed(2),
      balance: parseFloat(tx.balance).toFixed(2)
    }));

    res.render("statement", {
      employee: req.session.employee,
      account_no: account_no,
      transactions: transactions,
      error: null
    });

  } catch (err) {
    console.error("Statement error:", err);
    res.render("statementSearch", {
      employee: req.session.employee,
      error: "Error fetching statement. Please try again."
    });
  }
});


// ============================================================
// CUSTOMER REPORTS ROUTE
// ============================================================

app.get("/employee/customer-reports", isEmployee, async (req, res) => {
  try {
    // Fetch all customers
    const customersResult = await db.query(
      "SELECT account_no, fullname, balance, account_type FROM customers ORDER BY customer_id DESC"
    );

    const customers = customersResult.rows;

    // Calculate total balance
    const totalBalance = customers.reduce((sum, customer) => {
      return sum + parseFloat(customer.balance || 0);
    }, 0);

    // Get unique account types
    const accountTypes = [...new Set(customers.map(c => c.account_type).filter(Boolean))];

    res.render("CustomerReports", {
      employee: req.session.employee,
      customers: customers,
      totalBalance: totalBalance,
      accountTypes: accountTypes
    });

  } catch (err) {
    console.error("Customer reports error:", err);
    res.render("CustomerReports", {
      employee: req.session.employee,
      customers: [],
      totalBalance: 0,
      accountTypes: []
    });
  }
});


// ============================================================
// LOGOUT
// ============================================================

app.get("/employee-logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send("Error logging out");
    res.redirect("/");
  });
});

// ---------------- SERVER ---------------- //
app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
