const User = require("../models/user.model");
const authUtil = require("../util/authentication");

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

  await newUser.signup();

  res.redirect("/login");
}

function getLogin(req, res) {
  res.render("customer/auth/login");
}

async function login(req, res) {
  const user = new User(req.body.email, req.body.password);
  const existingUser = await user.getUserByEmail();

  if (!existingUser) {
    res.redirect("/login");
    return;
  }

  const passwordIsCorrect = await user.hasMatchingPassword(
    existingUser.password
  );

  if (!passwordIsCorrect) {
    res.redirect("/login");
    return;
  }

  authUtil.createUserSession(req, existingUser, function () {
    res.redirect("/");
  });
}

module.exports = {
  getSignup: getSignup,
  getLogin: getLogin,
  signup: signup,
  login: login,
};
