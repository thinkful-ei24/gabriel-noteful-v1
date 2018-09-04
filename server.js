'use strict';

// Load array of notes
const data = require('./db/notes');

console.log('Hello Noteful!');

// INSERT EXPRESS APP CODE HERE...
const express = require('express');
const app = express();

// Static server
app.use(express.static('public'));

// Listen
app
  .listen(8080, function() {
    console.log(`Server listening on ${this.address().port}`);
  })
  .on('error', err => {
    console.error(err);
  });

// Get all notes
app.get('/api/notes', (req, res) => {
  // Get the search term
  const { searchTerm } = req.query;
  // Send the result of a ternary
  res.json(
    checkIfRequestHasSearch(searchTerm)
      ? buildFilteredArrayOfItems(searchTerm)
      : data
  );
});

// Get a note by ID
app.get('/api/notes/:id', (req, res) => {
  res.json(findItemByID(getItemID(req)));
});

// Function for checking if we have the search term
function checkIfRequestHasSearch(searchTerm) {
  if (searchTerm) return true;
  return false;
}

// Function for building a filtered array of items
function buildFilteredArrayOfItems(searchTerm) {
  return data.filter(item => {
    if (checkIfItemHasSearchTerm(searchTerm, item)) return item;
  });
}

// Function for checking if item includes search term
function checkIfItemHasSearchTerm(searchTerm, item) {
  if (item.title.includes(searchTerm) || item.content.includes(searchTerm))
    return item;
}

// Function for getting the id from a request
function getItemID(request) {
  return request.params.id;
}

// Function for finding an item
function findItemByID(id) {
  return data.find(item => item.id === Number(id));
}
