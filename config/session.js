const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
require('dotenv').config();

const sessionStore = new PgSession({
  conString: `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}/${process.env.POSTGRES_DATABASE}`,
});

function createSessionConfig() {
  return {
    secret: 'super-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 2 * 24 * 60 * 60 * 1000,
    },
  };
}

module.exports = createSessionConfig;
