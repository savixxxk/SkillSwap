const router = require("express").Router();
const User = require("../models/User");

router.get("/:id", async (req, res) => {
  const tutor = await User.findById(req.params.id);

  const avgRating =
    tutor.ratings.length > 0
      ? tutor.ratings.reduce((a, b) => a + b) / tutor.ratings.length
      : 0;

  res.json({
    name: tutor.name,
    bio: tutor.bio,
    subjects: tutor.subjects,
    sessionsHeld: tutor.sessionsHeld,
    avgRating,
    profilePic: tutor.profilePic
  });
});

module.exports = router;