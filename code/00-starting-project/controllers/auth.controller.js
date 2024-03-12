const User = require('../models/user.model');
const authUtil = require('../util/authentication');
const validation = require('../util/validation');

// render signup form view
function getSignup(req, res) {
  res.render('customer/auth/signup');
}

// create user
async function signup(req, res, next) {
  // connect to DB - create new user
  const userData = [
    req.body.email,
    req.body.password,
    req.body.fullname,
    req.body.street,
    req.body.postal,
    req.body.city,
  ];

  if (
    !validation.userDetailsAreValid(...userData) ||
    !validation.emailIsConfirmed(req.body.email, req.body['confirm-email'])
  ) {
    res.redirect('/signup');
    return;
  }

  const newUser = new User(...userData);

  try {
    const existsAlready = await newUser.existsAlready();

    if (existsAlready) {
      res.redirect('/signup');
      return;
    }

    await newUser.signup();
  } catch (error) {
    next(error);
    return;
  }

  res.redirect('/login');
}

function getLogin(req, res) {
  res.render('customer/auth/login');
}

async function login(req, res) {
  const user = new User(req.body.email, req.body.password);
  let existingUser;
  try {
    existingUser = await user.getUserByEmail();
  } catch (error) {
    next(error);
    return;
  }

  if (!existingUser) {
    res.redirect('/login');
    return;
  }

  const passwordIsCorrect = await user.hasMatchingPassword(
    existingUser.password
  );

  if (!passwordIsCorrect) {
    res.redirect('/login');
    return;
  }

  authUtil.createUserSession(req, existingUser, function () {
    res.redirect('/');
  });
}

function logout(req, res) {
  authUtil.destroyUserAuthSession(req);
  res.redirect('/');
}

module.exports = {
  getSignup: getSignup,
  getLogin: getLogin,
  signup: signup,
  login: login,
  logout: logout,
};
