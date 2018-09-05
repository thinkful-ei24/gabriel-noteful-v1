'use strict';
/***** Variables and modules *****/
const express = require('express');
const app = express();
const { PORT } = require('./config');
const morgan = require('morgan');
// Routers
const notesRouter = require('./router/notes.router');
// Utilities
const { buildNewError } = require('./lib/utilities');

/***** Error logging *****/
app.use(morgan('dev'));

// Static server
app.use(express.static('public'));

// Add body parser
app.use(express.json());

// Mount the router
app.use('/api', notesRouter);

// 404 not found handler
app.use(function(req, res, next) {
  const err = buildNewError('Not found');
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

/***** Error handler functions *****/
// Handle 404 errors
function handle404Error(res, err, next) {
  err.status = 404;
  next(err);
}

// Handle catch all errors
function handleCatchAllErrors(res, err) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
}
