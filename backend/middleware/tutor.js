const tutor = (req, res, next) => {
  if (req.user.role !== 'tutor') {
    return res.status(403).json({ message: 'Access denied. Tutor role required.' });
  }
  next();
};

module.exports = tutor;