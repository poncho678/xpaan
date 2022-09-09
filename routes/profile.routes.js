const express = require("express");
const profileRouter = express.Router();

const { v2: cloudinary } = require("cloudinary");
const { cloudinaryFolder } = require("../utils/consts");

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
profileRouter.use(isLoggedIn);
profileRouter.use(checkIfUserExists);

// main profile page
profileRouter.get("/", async (req, res) => {
  const { username } = res.locals.user;
  return res.render("profile/profile", { username });
});

// update username
profileRouter.get("/update-username", async (req, res) => {
  const { username } = res.locals.user;
  return res.render("profile/update-username", { username });
});

profileRouter.post("/update-username", async (req, res) => {
  const { username, _id } = res.locals.user;
  const { newUsername, confirmNewUsername } = req.body;

  if (!newUsername) {
    return res.status(400).render("profile/update-username", {
      username,
      errorMessage: "Please enter a username.",
    });
  }
  if (!confirmNewUsername) {
    return res.status(400).render("profile/update-username", {
      username,
      errorMessage: "Please confirm your username.",
    });
  }
  if (newUsername !== confirmNewUsername) {
    return res.status(400).render("profile/update-username", {
      username,
      errorMessage: "Yeah... That was not the same.",
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
profileRouter.get("/update-password", (req, res) => {
  return res.render("profile/update-password");
});
profileRouter.post("/update-password", async (req, res) => {
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
    return res.status(400).render("profile/update-password", {
      user,
      errorMessage: "Something failed...",
    });
  }
  const salt = bcrypt.genSaltSync(15);
  const hashedPassword = await bcrypt.hashSync(newPassword, salt);

  await User.findByIdAndUpdate(user._id, { password: hashedPassword });

  return res.redirect("/");
});

// delete user
profileRouter.get("/delete-user", (req, res) => {
  const { username, _id } = res.locals.user;
  return res.render("profile/delete-user", { username });
});

profileRouter.post("/delete-user", async (req, res) => {
  const { username, _id, collections } = res.locals.user;
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

  const allImages = await ItemModel.find({
    collectionId: collections,
    img: { $nin: [null, ""] },
  });
  await allImages.map(async (item) => {
    const public_id = item.img.slice(
      item.img.indexOf(cloudinaryFolder),
      item.img.lastIndexOf(".")
    );

    if (public_id) {
      return await cloudinary.uploader.destroy(
        public_id,
        function (error, result) {
          console.log(result, error);
        }
      );
    }
  });

  await ItemModel.deleteMany({ collectionId: collections });
  await CollectionModel.deleteMany({ _id: collections });
  await User.findByIdAndDelete({ _id });

  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .render("auth/logout", { errorMessage: err.message });
    }
    return res.redirect("/");
  });
});

module.exports = profileRouter;
