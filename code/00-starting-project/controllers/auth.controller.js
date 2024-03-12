const User = require("../models/user.model");

// render signup form view
function getSignup(req, res) {
  res.render("customer/auth/signup");
}

// create user
async function signup(req, res) {
  // connect to DB - create new user
  const userData = [
    req.body.email,
    // req.body["confirm-email"],
    req.body.password,
    req.body.fullname,
    req.body.street,
    req.body.postal,
    req.body.city,
  ];

  const newUser = new User(...userData);

  console.log(newUser);

  await newUser.signup();

  res.redirect("/login");
}

function getLogin(req, res) {
  res.render("customer/auth/login");
}

module.exports = {
  getSignup: getSignup,
  getLogin: getLogin,
  signup: signup,
};
