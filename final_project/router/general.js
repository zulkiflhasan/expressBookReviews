const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');
const public_users = express.Router();

public_users.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || !username.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({message: 'Username and password are required'});
  }
  if (isValid(username)) return res.status(409).json({message: 'User already exists'});
  users.push({username, password});
  return res.status(201).json({message: 'User successfully registered'});
});

public_users.get('/', (req, res) => res.json(books));
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.json(book) : res.status(404).json({message: 'Book not found'});
});
public_users.get('/author/:author', (req, res) => {
  const matches = Object.fromEntries(Object.entries(books).filter(([, book]) =>
    book.author.toLowerCase() === req.params.author.toLowerCase()));
  return res.json(matches);
});
public_users.get('/title/:title', (req, res) => {
  const matches = Object.fromEntries(Object.entries(books).filter(([, book]) =>
    book.title.toLowerCase() === req.params.title.toLowerCase()));
  return res.json(matches);
});
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.json(book.reviews) : res.status(404).json({message: 'Book not found'});
});

// Assignment tasks 10–13: Promise callbacks / async-await with Axios.
const baseURL = 'http://localhost:5000';
const getAllBooksAsync = async () => (await axios.get(baseURL + '/')).data;
const getBookByISBNAsync = isbn => new Promise((resolve, reject) => {
  axios.get(baseURL + '/isbn/' + encodeURIComponent(isbn))
    .then(response => resolve(response.data)).catch(reject);
});
const getBooksByAuthorAsync = async author =>
  (await axios.get(baseURL + '/author/' + encodeURIComponent(author))).data;
const getBooksByTitleAsync = title => new Promise((resolve, reject) => {
  axios.get(baseURL + '/title/' + encodeURIComponent(title))
    .then(response => resolve(response.data)).catch(reject);
});
module.exports = { general: public_users, getAllBooksAsync, getBookByISBNAsync, getBooksByAuthorAsync, getBooksByTitleAsync };
