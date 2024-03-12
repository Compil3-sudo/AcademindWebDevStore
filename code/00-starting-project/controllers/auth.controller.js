const db = require("../data/database");

// render signup form view
function getSignup(req, res) {
  res.render("customer/auth/signup");
}

// create user
function signup(req, res) {
  // connect to DB - create new user
}

function getLogin(req, res) {
  res.render("customer/auth/login");
}

module.exports = {
  getSignup: getSignup,
  getLogin: getLogin,
  signup: signup,
};
