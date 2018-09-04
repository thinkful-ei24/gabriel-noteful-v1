'use strict';
/***** Variables and modules *****/
const data = require('./db/notes');
const simDB = require('./db/simDB');
const notes = simDB.initialize(data);
const express = require('express');
const app = express();
const { PORT } = require('./config');
const { logErrors } = require('./middleware/logger');

// Static server
app.use(express.static('public'));

// Add body parser
app.use(express.json());

/***** HTTP request handlers *****/
// Get all notes
app.get('/api/notes', (req, res, next) => {
  getAllNotes(req, res, next);
});

// Function for returning the search term from a query object
function destructureSearchTerm(req) {
  return req.query.searchTerm;
}

// Get a note by ID
app.get('/api/notes/:id', (req, res, next) => {
  findNoteByID(req, res, next);
});

// Update a note by ID
app.put('/api/notes/:id', (req, res, next) => {
  updateNoteByID(req, res, next);
});

/***** Error logging *****/
app.use(logErrors);

// 404 not found handler
app.use(function(req, res, next) {
  const err = new Error('Not found');
  handle404Error(res, err, next);
});

// Catch all error handler
app.use(function(err, req, res, next) {
  handleCatchAllErrors(res, err);
});

// Listen
app
  .listen(PORT, function() {
    console.log(`Server listening on ${this.address().port}`);
  })
  .on('error', err => {
    console.error(err);
  });

/***** Functions *****/

/*** Routing functions ***/
// Function for getting all notes
function getAllNotes(req, res, next) {
  // Get the search term
  const searchTerm = destructureSearchTerm(req);
  // Send the result of a ternary
  notes.filter(searchTerm, (err, list) => {
    generateResponse(err, list, next, res);
  });
}

// Function for updating a note by ID
function updateNoteByID(req, res, next) {
  // Validate input
  const { id, updateObject, updateFields } = createValidationObject(req);
  validateInput(updateObject, updateFields, req);

  notes.update(id, updateObject, (err, item) => {
    generateResponse(err, item, next, res);
  });
}

// Function for finding note by ID
function findNoteByID(req, res, next) {
  notes.find(getItemID(req), (err, item) => {
    generateResponse(err, item, next, res);
  });
}

/*** Error handler functions ***/
function handle404Error(res, err, next) {
  err.status = 404;
  res.status(404).json({ message: 'Not found' });
  next(err);
}
function handleCatchAllErrors(res, err) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
}

/*** Utility functions ***/
// Function for getting the id from a request
function getItemID(request) {
  return request.params.id;
}

// Function for validating input
function validateInput(updateObject, updateFields, req) {
  // Look through all fields and check if the field is in the request body
  updateFields.forEach(field => {
    if (field in req.body) updateObject[field] = req.body[field];
  });
}

// Function for updating item
function generateResponse(err, item, next, res) {
  // If there's an error call the next error middleware
  if (err) return next(err);
  // If item exists respond with it, otherwise go to the next
  item ? res.json(item) : next();
}

// Function for creating update object and fields
function createValidationObject(req) {
  return {
    id: createIDObject(req),
    updateObject: {},
    updateFields: ['title', 'content']
  };
}

// Function for creating ID object
function createIDObject(req) {
  return getItemID(req);
}
