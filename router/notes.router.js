// Express
const express = require('express');
const router = express.Router();
// DB
const data = require('../db/notes');
const simDB = require('../db/simDB');
const notes = simDB.initialize(data);
// Utilities
const { truthy, buildNewError } = require('../lib/utilities');

/***** HTTP request handlers *****/
// Create new note
router.post('/notes', (req, res, next) => {
  createNote(req, res, next);
});

// GET all notes
router.get('/notes', (req, res, next) => {
  getAllNotes(req, res, next);
});

// GET note ID
router.get('/notes/:id', (req, res, next) => {
  findNoteByID(req, res, next);
});

// Update note by ID
router.put('/notes/:id', (req, res, next) => {
  updateNoteByID(req, res, next);
});

/***** Routing functions *****/
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
  validateUpdateInput(updateObject, updateFields, req);

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

// Function for creating a new note
function createNote(req, res, next) {
  // Create and validate new item
  const newItem = buildNewItemObject(req.body);
  validateNewItem(newItem, next);
  addNoteToDB(req, res, next, newItem);
}

/*** Utility functions ***/
// Function for getting the id from a request
function getItemID(request) {
  return request.params.id;
}

// Function for creating ID object
function createIDObject(req) {
  return getItemID(req);
}

// Function for returning the search term from a query object
function destructureSearchTerm(req) {
  return req.query.searchTerm;
}

// Function for validating input
function validateUpdateInput(updateObject, updateFields, req) {
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

// Function for body request and building new item obj
function buildNewItemObject(req) {
  return { title: req.title, content: req.content };
}

// Function for new item validation
function validateNewItem(object, next) {
  if (!truthy(object.title)) {
    const err = buildNewError('Missing title in request body');
    err.status = 400;
    return next(err);
  }
}

// Function for creating new note
function addNoteToDB(req, res, next, note) {
  notes.create(note, (err, item) => {
    if (err) return next(err);

    if (item) {
      res
        .location(`http://${req.headers.host}/notes/${item.id}`)
        .status(201)
        .json(item);
    } else {
      next();
    }
  });
}

// Export module
module.exports = router;
