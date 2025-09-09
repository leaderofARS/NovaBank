const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true })); 
app.use(express.static("public")); 

// Set EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Route: Login Page
app.get("/", (req, res) => {
  res.render("login");
});

// Route: Handle Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "employee" && password === "1234") {
    res.redirect("/dashboard");
  } else if (username === "manager" && password === "admin") {
    res.redirect("/manager");
  } else {
    res.send("❌ Invalid login. <a href='/'>Try again</a>");
  }
});

// Route: Employee Dashboard
app.get("/dashboard", (req, res) => {
  res.render("dashboard", { employeeName: "John Doe" });
});

// Route: Manager Page
app.get("/manager", (req, res) => {
  res.render("manager_login");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
