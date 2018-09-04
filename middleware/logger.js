module.exports.logErrors = logErrors;

function logErrors(req, res, next) {
  const date = new Date();
  console.log(
    `Date: ${date.toLocaleString()} Request: ${req.method} URL: ${req.url}`
  );
  next();
}
