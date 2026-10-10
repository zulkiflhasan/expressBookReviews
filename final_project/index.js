const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const app = express();
app.use(express.json());
app.use('/customer', session({
  secret: process.env.SESSION_SECRET || 'bookreview-local-session-secret',
  resave: false,
  saveUninitialized: false
}));
app.use('/customer/auth', (req, res, next) => {
  const auth = req.session && req.session.authorization;
  if (!auth || !auth.accessToken) return res.status(401).json({message: 'Login required'});
  try {
    const decoded = jwt.verify(auth.accessToken, process.env.JWT_SECRET || 'bookreview-local-dev-secret');
    if (decoded.username !== auth.username) throw new Error('Session mismatch');
    return next();
  } catch (error) { return res.status(401).json({message: 'Session expired or invalid'}); }
});
app.use('/customer', customer_routes);
app.use('/', genl_routes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server is running on port ' + PORT));
