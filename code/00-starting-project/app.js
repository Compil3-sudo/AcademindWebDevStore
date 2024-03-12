const express = require("express");
const path = require("path");
const db = require("./data/database");

const app = express();
const port = 3000;

app.use(express.static("public"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const authRoutes = require("./routes/auth.routes");

app.use(authRoutes);

app.get("/", (req, res) => {
  res.render("customer/auth/signup");
});

db.getConnection()
  .then((connection) => {
    console.log("Connected to MySQL database");
    // Start listening for incoming requests
    const server = app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
    // Optionally, you can release the connection once the server starts listening
    connection.release();
  })
  .catch((err) => {
    // Handle database connection error
    console.error("Error connecting to MySQL database:", err);
  });
