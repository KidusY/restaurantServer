const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = mongoose.model("User");

const router = express.Router();

router.post("/auth/signup", async (req, res) => {
  const { email, password, displayName } = req.body;
  const newUser = {
    email,
    password,
    favorites: null,
    profileImg: null,
    displayName,
  };

  try {
    const user = new User(newUser);
    const emailExists = await User.find(
      { email: email },
      { email: 1, favorites: 1, displayName: 1 }
    );
    console.log(emailExists);
    const displayNameExists = await User.find(
      { displayName: displayName },
      { email: 1, favorites: 1, displayName: 1 }
    );
    if (emailExists.length !== 0) {
      return res
        .status(422)
        .json({ error: "This Email already in Use Please Login" });
    }
    if (displayNameExists.length !== 0) {
      console.log("user");
      return res.status(422).json({
        error: "This Display Name already in Use try a different one",
      });
    }
    await user.save();

    const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");
    res.send({ token });
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }
});

router.post("/auth/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: "Must provide email and password" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(422).send({ error: "Invalid password or email" });
  }

  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");
    res.send({ token, user });
  } catch (err) {
    return res.status(422).json({ error: "Invalid password or email" });
  }
});

module.exports = router;
