const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = mongoose.model("User");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();
const userExists = async (req, res, next) => {
  let user = await User.find(
    { _id: req.params.id },
    {
      email: 1,
      favorites: 1,
      displayName: 1,
      profileImg: 1,
    }
  );
  if (user.length === 0) {
    return res.status(400).json({ error: "User doesn't exist" });
  }

  req.user = user;
  next();
};
router.get("/users", requireAuth, async (req, res) => {
  let allUsers = await User.find(
    {},
    {
      email: 1,
      favorites: 1,
      displayName: 1,
      profileImg: 1,
    }
  );
  res.json(allUsers);
});

router
  .route("/users/:id")
  .all(requireAuth, userExists)
  .get(async (req, res) => {
    res.json(req.user);
  })
  .put(async (req, res) => {
    const { email, displayName, favorites, profileImg } = req.body;
    let updatedInfo = {
      email,
      displayName,
      favorites,
      profileImg,
    };
    for (const field of ["email", "displayName", "favorites", "profileImg"])
      if (!updatedInfo[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        });

    let updatedData = await User.updateOne(
      { _id: req.user[0]._id },
      { $set: updatedInfo }
    );
    res.json(updatedData);
  })
  .delete(async (req, res) => {
    console.log(req.user[0]._id);
    let deletedUser = await User.deleteOne({ _id: req.user[0]._id });
    res.json("Deleted", deletedUser);
  });

module.exports = router;
