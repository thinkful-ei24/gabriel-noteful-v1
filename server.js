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
  res.json(data);
});

// Get a note by ID
app.get('/api/notes/:id', (req, res) => {
  console.log(req.params.id);
  const id = req.params.id;
  console.log(id);
  const foundItem = data.find(item => item.id === Number(id));
  res.json(foundItem);
});
