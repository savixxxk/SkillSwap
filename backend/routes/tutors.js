const express = require('express');
const { getTutors, getTopTutors, getTutorById, updateTutor } = require('../controllers/tutorController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getTutors);

router.get('/top', getTopTutors);

router.route('/:id')
  .get(getTutorById)
  .put(protect, requireRole('tutor'), updateTutor);

module.exports = router;
