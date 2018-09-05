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
/*** Create new note ***/
router.post('/notes', (req, res, next) => {
  createNoteHandler(req, res, next);
});

/*** GET all notes ***/
router.get('/notes', (req, res, next) => {
  getAllNoteHandler(req, res, next);
});

/*** GET note ID ***/
router.get('/notes/:id', (req, res, next) => {
  getNoteByID(req, res, next);
});

/*** Update note by ID ***/
router.put('/notes/:id', (req, res, next) => {
  handleUpdateNoteByID(req, res, next);
});

/*** Delete note by ID ***/
router.delete('/notes/:id', (req, res, next) => {
  if (truthy(getItemID(req))) deleteNoteByID(getItemID(req), req, res, next);
});

/***** Routing functions *****/

/*** CRUD handlers ***/
// CREATE
function createNoteHandler(req, res, next) {
  // Create and validate new item
  const newItem = buildNewItemObject(req.body);
  validateNewItem(newItem, next);
  addNoteToDB(req, res, next, newItem);
}

// READ
function getAllNoteHandler(req, res, next) {
  // Get the search term
  const searchTerm = destructureSearchTerm(req);
  // Send the result of a ternary
  notes.filter(searchTerm, (err, list) => {
    generateResponse(err, list, next, res);
  });
}

// UPDATE
function handleUpdateNoteByID(req, res, next) {
  // Validate input
  const { id, updateObject, updateFields } = createValidationObject(req);
  validateUpdateInput(updateObject, updateFields, req);

  notes.update(id, updateObject, (err, item) => {
    generateResponse(err, item, next, res);
  });
}

// DELETE
function deleteNoteByID(id, req, res, next) {
  notes.delete(id, (err, item) => {
    if (err) return next(err);

    if (item) {
      res.status(204).send();
    } else {
      err.status = 500;
      next();
    }
  });
}

// Function for finding note by ID
function getNoteByID(req, res, next) {
  notes.find(getItemID(req), (err, item) => {
    generateResponse(err, item, next, res);
  });
}

/***** Utility functions *****/
// Function for getting the id from a request
function getItemID(request) {
  return request.params.id;
}

// Function for creating ID object
function createIDObject(req) {
  return getItemID(req);
}

// Function for updating item
function generateResponse(err, item, next, res) {
  // If there's an error call the next error middleware
  if (err) return next(err);
  // If item exists respond with it, otherwise go to the next
  item ? res.json(item) : next();
}

/*** CRUD utilities ***/

/* CREATE utilities */
// Function for body request and building new item obj
function buildNewItemObject(req) {
  return { title: req.title, content: req.content };
}

// Function for new item validation
function validateNewItem(object, next) {
  // Check if title is not truthy and return an error
  if (!truthy(object.title)) {
    const err = buildNewError('Missing title in request body');
    err.status = 400;
    return next(err);
  }
}

// Function for creating new note
function addNoteToDB(req, res, next, note) {
  // Call notes.create
  notes.create(note, (err, item) => {
    if (err) return next(err);

    // Respond with location and status 201
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

/* READ utilities */
// Function for returning the search term from a query object
function destructureSearchTerm(req) {
  return req.query.searchTerm;
}

/* UPDATE utilities */
// Function for creating update object and fields
function createValidationObject(req) {
  return {
    id: createIDObject(req),
    updateObject: {},
    updateFields: ['title', 'content']
  };
}

// Function for validating input
function validateUpdateInput(updateObject, updateFields, req) {
  // Look through all fields and check if the field is in the request body
  updateFields.forEach(field => {
    if (field in req.body) updateObject[field] = req.body[field];
  });
}

// Export module
module.exports = router;
