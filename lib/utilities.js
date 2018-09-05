module.exports = { exists, truthy, buildNewError };
/***** Functional utility functions *****/
// Function for checking if something exists
function exists(x) {
  return x !== null && x !== undefined;
}

// Function for checking if something is true
function truthy(x) {
  return x !== false && exists(x);
}

// Function for generating errors
function buildNewError(errorMessage) {
  return new Error(errorMessage);
}
