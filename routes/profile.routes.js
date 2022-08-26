const express = require("express");
const profileRouter = express.Router();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const {
  Types: { ObjectId },
} = require("mongoose");

// Require the User model, CollectionModel, ItemModel in order to interact with the database
const User = require("../models/User.model");
const CollectionModel = require("../models/Collection.model");
const ItemModel = require("../models/Item.model");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

async function checkIfUserExists(req, res, next) {
  const user = await User.findById(req.session.user._id);
  if (!user) {
    return res.redirect("/");
  }
  res.locals.user = user;
  next();
}

// perform check on every profile call
profileRouter.use(checkIfUserExists);

// main profile page
profileRouter.get("/", isLoggedIn, async (req, res) => {
  const { username } = res.locals.user;
  return res.render("profile/profile", { username });
});

// update username
profileRouter.get("/update-username", isLoggedIn, async (req, res) => {
  const { username } = res.locals.user;
  return res.render("profile/update-username", { username });
});

profileRouter.post("/update-username", isLoggedIn, async (req, res) => {
  const { username, _id } = res.locals.user;
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
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      username: newUsername,
    },
    {
      new: true,
    }
  );

  return res.render("profile/profile", { username: updatedUser.username });
});

// update password
profileRouter.get("/update-password", isLoggedIn, (req, res) => {
  return res.render("profile/update-password");
});
profileRouter.post("/update-password", isLoggedIn, async (req, res) => {
  const { user } = res.locals;

  const {
    currentPassword = "",
    newPassword = "",
    confirmNewPassword = "",
  } = req.body;

  if (
    !currentPassword ||
    newPassword.length < 8 ||
    confirmNewPassword.length < 8 ||
    newPassword !== confirmNewPassword
  ) {
    //
    return res.status(400).render("profile/update-password", {
      errorMessage: "Fill every input correctly",
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).render("profile/update-password", {
      errorMessage: "Please enter a new password",
    });
  }

  const isSamePassword = bcrypt.compareSync(currentPassword, user.password);
  if (!isSamePassword) {
    return res.status(400).render("settings/update-password", {
      user,
      errorMessage: "That is not your password",
    });
  }
  const salt = bcrypt.genSaltSync(15);
  const hashedPassword = await bcrypt.hashSync(newPassword, salt);

  await User.findByIdAndUpdate(user._id, { password: hashedPassword });

  return res.redirect("/");
});

// delete user
profileRouter.get("/delete-user", isLoggedIn, (req, res) => {
  const { username, _id } = res.locals.user;
  return res.render("profile/delete-user", { username });
});

profileRouter.post("/delete-user", isLoggedIn, (req, res) => {
  const { username, _id } = res.locals.user;
  const { confirmUsername } = req.body;

  if (!confirmUsername) {
    return res.status(400).render("profile/delete-user", {
      username,
      errorMessage: "Please confirm your Username...",
    });
  }
  if (confirmUsername !== username) {
    return res.status(400).render("profile/delete-user", {
      username,
      errorMessage: `“${confirmUsername}” is not your username. Try again.`,
    });
  }

  return res.render("profile/delete-user");
});

module.exports = profileRouter;
