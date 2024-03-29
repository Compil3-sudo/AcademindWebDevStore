function createUserSession(req, user, action) {
  req.session.uid = user.id.toString();
  req.session.isAdmin = user.is_admin;
  req.session.save(action);
}

function destroyUserAuthSession(req) {
  req.session.uid = null;
}

module.exports = {
  createUserSession: createUserSession,
  destroyUserAuthSession: destroyUserAuthSession,
};
