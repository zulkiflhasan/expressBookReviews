const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');
const regd_users = express.Router();
const users = [];
const isValid = username => users.some(user => user.username === username);
const authenticatedUser = (username, password) =>
  users.some(user => user.username === username && user.password === password);

regd_users.post('/login', (req, res) => {
  const {username, password} = req.body || {};
  if (!authenticatedUser(username, password))
    return res.status(401).json({message: 'Invalid username or password'});
  const token = jwt.sign({username}, process.env.JWT_SECRET || 'bookreview-local-dev-secret', {expiresIn: '1h'});
  req.session.authorization = {accessToken: token, username};
  return res.json({message: 'User successfully logged in'});
});
regd_users.put('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({message: 'Book not found'});
  const review = req.query.review || (req.body && req.body.review);
  if (!review) return res.status(400).json({message: 'Review required'});
  book.reviews[req.session.authorization.username] = review;
  return res.json({message: 'Review successfully added/updated', reviews: book.reviews});
});
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({message: 'Book not found'});
  const username = req.session.authorization.username;
  if (!(username in book.reviews)) return res.status(404).json({message: 'Review not found'});
  delete book.reviews[username];
  return res.json({message: 'Review successfully deleted', reviews: book.reviews});
});
module.exports = { authenticated: regd_users, isValid, users, authenticatedUser };
