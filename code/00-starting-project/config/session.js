const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
require("dotenv").config();

const options = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "wdeshop",
};

const sessionStore = new MySQLStore(options);

function createSessionConfig() {
  return {
    secret: "super-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 2 * 24 * 60 * 60 * 1000,
    },
  };
}

module.exports = createSessionConfig;
