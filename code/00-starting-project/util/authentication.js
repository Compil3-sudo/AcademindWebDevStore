function createUserSession(req, user, action) {
  req.session.uid = user.id.toString();
  req.session.save(action);
}

module.exports = {
  createUserSession: createUserSession,
};
