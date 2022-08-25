const express = require("express");
const profileRouter = express.Router();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const {
  Types: { ObjectId },
} = require("mongoose");

const saltRounds = 14;

// Require the User model in order to interact with the database
const User = require("../models/User.model");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

async function checkIfUserExists(req, res, next) {
  const user = await User.findById(req.session.user._id);

  if (!user) {
    return res.redirect("/");
  }

  req.user = user;

  next();
}

profileRouter.use(checkIfUserExists);

profileRouter.get("/", isLoggedIn, (req, res) => {
  const { username } = req.user;
  return res.render("profile/profile", { username });
});

profileRouter.get("/update-username", isLoggedIn, (req, res) => {
  const { username } = req.user;
  return res.render("profile/update-username", { username });
});

profileRouter.post("/update-username", isLoggedIn, async (req, res) => {
  const { username, _id } = req.user;
  const { newUsername } = req.body;

  if (!newUsername) {
    return res.status(400).render("profile/update-username", {
      username,
      errorMessage: "Please enter a username.",
    });
  }
  if (username === newUsername) {
    return res.status(400).render("profile/update-username", {
      username,
      errorMessage: "It’s the same... Again...",
    });
  }

  const findUser = await User.findOne({
    $or: [{ username: newUsername }],
    _id: { $ne: ObjectId(_id) },
  });

  if (findUser) {
    return res.status(400).render("profile/update-username", {
      username,
      errorMessage: `${newUsername} is already taken`,
    });
  }
  console.log(newUsername);
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      username: newUsername,
    },
    {
      new: true,
    }
  );
  req.session.user.username = updatedUser.username;
  return res.render("profile/profile", { username: newUsername });
});

profileRouter.get("/update-password", isLoggedIn, (req, res) => {
  return res.render("profile/update-password");
});

profileRouter.post("/update-password", isLoggedIn, (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  return res.render("profile/update-password");
});

profileRouter.get("/delete-user", isLoggedIn, (req, res) => {
  return res.render("profile/delete-user");
});

module.exports = profileRouter;
