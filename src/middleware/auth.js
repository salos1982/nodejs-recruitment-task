const jwt = require('jsonwebtoken');
const User = require('../User');

const scheme = 'Bearer';
const { JWT_SECRET } = process.env;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'authroization missing' })
  }

  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== scheme) {
    return res.status(401).json({ message: 'authorization scheme is incorrect'});
  }

  try {
    const tokenData = jwt.verify(tokenParts[1], JWT_SECRET);
    req.user = new User(tokenData.id, tokenData.role, tokenData.name);
  } catch(err) {
    console.error(err.message)
    return res.status(401).json({ message: err.message });
  }

  next();
}

module.exports = {
  authMiddleware,
};