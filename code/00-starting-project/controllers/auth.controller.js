function getSignup(req, res) {
  res.render("signup");
}

function getLogin(req, res) {
  res.render("login");
}

module.exports = {
  getSignup: getSignup,
  getLogin: getLogin,
};
