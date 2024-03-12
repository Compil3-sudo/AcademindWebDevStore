const User = require('../models/user.model');
const authUtil = require('../util/authentication');
const validation = require('../util/validation');
const sessionFlash = require('../util/session-flash');

// render signup form view
function getSignup(req, res) {
  let sessionData = sessionFlash.getSessionData(req);
  console.log(sessionData);
  if (!sessionData) {
    sessionData = {
      email: '',
      confirmEmail: '',
      password: '',
      fullname: '',
      street: '',
      postal: '',
      city: '',
    };
  }

  res.render('customer/auth/signup', { inputData: sessionData });
}

// create user
async function signup(req, res, next) {
  // connect to DB - create new user
  const userInputData = {
    email: req.body.email,
    confirmEmail: req.body['confirm-email'],
    password: req.body.password,
    fullname: req.body.fullname,
    street: req.body.street,
    postal: req.body.postal,
    city: req.body.city,
  };

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
    sessionFlash.flashDataToSession(
      req,
      {
        errorMessage:
          'Please check your input. Password must be at least 6 characters long and postal code must be 5.',
        ...userInputData,
      },
      function () {
        res.redirect('/signup');
      }
    );
    return;
  }

  const newUser = new User(...userData);

  try {
    const existsAlready = await newUser.existsAlready();

    if (existsAlready) {
      sessionFlash.flashDataToSession(
        req,
        {
          errorMessage: 'user already exists',
          ...userInputData,
        },
        () => {
          res.redirect('/signup');
        }
      );
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
  let sessionData = sessionFlash.getSessionData(req);

  if (!sessionData) {
    sessionData = {
      email: '',
      password: '',
    };
  }

  res.render('customer/auth/login', { inputData: sessionData });
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
    sessionFlash.flashDataToSession(
      req,
      {
        errorMessage: 'Invalid credentials. check email and pass',
        email: user.email,
        password: user.password,
      },
      () => {
        res.redirect('/login');
      }
    );
    return;
  }

  const passwordIsCorrect = await user.hasMatchingPassword(
    existingUser.password
  );

  if (!passwordIsCorrect) {
    sessionFlash.flashDataToSession(
      req,
      {
        errorMessage: 'Invalid credentials. check email and pass',
        email: user.email,
        password: user.password,
      },
      () => {
        res.redirect('/login');
      }
    );
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
