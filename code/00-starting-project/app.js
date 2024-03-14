const express = require('express');
const path = require('path');
const db = require('./data/database');
const csrf = require('csurf');

// Middlewares
const addCsrfTokenMiddleware = require('./middlewares/csrf');
const errorHandlerMiddleware = require('./middlewares/error-handler');
const checkAuthStatusMiddleware = require('./middlewares/check-auth');
const protectRoutesMiddleware = require('./middlewares/protect-routes');
const cartMiddleware = require('./middlewares/cart');
const updateCartPrices = require('./middlewares/update-cart-prices');
const notFoundMiddleware = require('./middlewares/not-found');

// session
const expressSession = require('express-session');
const createSessionConfig = require('./config/session');
const sessionConfig = createSessionConfig();

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use('/products/assets', express.static('product-data'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// routes
const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const baseRoutes = require('./routes/base.routes');
const adminRoutes = require('./routes/admin.routes');
const cartRoutes = require('./routes/cart.routes');
const ordersRoutes = require('./routes/orders.routes');

app.use(expressSession(sessionConfig));
app.use(csrf());
app.use(addCsrfTokenMiddleware); // this distributes generated tokens to all other middleware / route handlers and views
app.use(checkAuthStatusMiddleware);
app.use(cartMiddleware);
app.use(updateCartPrices);

app.use(baseRoutes);
app.use(authRoutes);
app.use(productsRoutes);
app.use('/cart', cartRoutes);

// app.use(protectRoutesMiddleware); // if this is here then notFoundMiddleware no longer executes
// the following routes are protected by protectRoutesMiddleware
app.use('/admin', protectRoutesMiddleware, adminRoutes);
app.use('/orders', protectRoutesMiddleware, ordersRoutes);

app.use(notFoundMiddleware);

app.use(errorHandlerMiddleware);

db.getConnection()
  .then((connection) => {
    console.log('Connected to MySQL database');
    // Start listening for incoming requests
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    // Optionally, you can release the connection once the server starts listening
    connection.release();
  })
  .catch((err) => {
    // Handle database connection error
    console.error('Error connecting to MySQL database:', err);
  });
