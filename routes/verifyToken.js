const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const token = req.headers['authorization']
  if (!token) return res.status(400).send('No access');
  try {
    const verified = jwt.verify(token, process.env.token);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};
