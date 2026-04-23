const express = require('express');
const { createReview, getTutorReviews } = require('../controllers/reviewController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, requireRole('student'), createReview);

router.get('/tutor/:tutorId', getTutorReviews);

module.exports = router;
