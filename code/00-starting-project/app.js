const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.static("public"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const authRoutes = require("./routes/auth.routes");

app.use(authRoutes);

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(port);
