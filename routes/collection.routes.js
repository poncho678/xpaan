const express = require("express");
const { isValidObjectId } = require("mongoose");
const collectionRouter = express.Router();
const CollectionModel = require("../models/Collection.model");
const UserModel = require("../models/User.model");

// Middleware to check if the Id is valid an if the User is Authorized to View the collection...
function validateIdAndAuthorization(req, res, next) {
  res.locals.collectionId = req.params.collectionId;
  const { collectionId } = res.locals;
  const isValidCollectionId = isValidObjectId(collectionId);

  if (!isValidCollectionId) {
    console.log("not valid id");
    return res.status(404).redirect("/collection");
  }
  if (!req.session.user.collections.includes(collectionId)) {
    console.log("user does not own collection");
    return res.status(404).redirect("/collection");
  }
  next();
}

// View All Collections
collectionRouter.get("/", async (req, res) => {
  const currentUser = await UserModel.findById(req.session.user._id);
  const collections = await CollectionModel.find({
    _id: { $in: currentUser.collections },
  });
  res.render("collection/home", { collections });
});

// Create A Collection
collectionRouter.get("/create", (req, res) => {
  res.render("collection/create");
});
collectionRouter.post("/create", async (req, res) => {
  let { name, description, isTodoList } = req.body;
  isTodoList = isTodoList === "on" ? true : false;

  if (!name) {
    return res.status(400).render("collection/create", { ...req.body });
  }

  const createdCollection = await CollectionModel.create({
    name,
    description,
    isTodoList,
  });

  const updateUser = await UserModel.findByIdAndUpdate(req.session.user, {
    $push: { collections: createdCollection._id },
  });
  // also add collection to currently logged in user???
  req.session.user.collections.push(createdCollection._id);

  res.redirect(`/collection/${createdCollection._id}`);
});

collectionRouter.get(
  "/:collectionId",
  validateIdAndAuthorization,
  async (req, res) => {
    const { collectionId } = res.locals;
    const possibleCollection = await CollectionModel.findById(
      collectionId
    ).populate("items");

    if (!possibleCollection) {
      return res.status(404).redirect("/collection");
    }
    const { name, description, items, isTodoList, _id } = possibleCollection;

    res.render("collection/view", {
      name,
      description,
      items,
      isTodoList,
      _id,
    });
  }
);

// edit collection
collectionRouter.get(
  "/:collectionId/edit",
  validateIdAndAuthorization,
  async (req, res) => {
    const { collectionId } = res.locals;
    const collection = await CollectionModel.findById(collectionId);

    const { name, description, items, isTodoList, _id } = collection;
    res.render("collection/edit", {
      name,
      description,
      items,
      isTodoList,
      _id,
    });
  }
);
collectionRouter.post(
  "/:collectionId/edit",
  validateIdAndAuthorization,
  async (req, res) => {
    const { collectionId } = res.locals;
    let { name, description, isTodoList } = req.body;
    isTodoList = isTodoList === "on" ? true : false;

    if (!name) {
      // maybe include error message...
      return res.status(400).render("collection/create", { ...req.body });
    }

    await CollectionModel.findByIdAndUpdate(collectionId, {
      name,
      description,
      isTodoList,
    });

    res.redirect(`/collection/${collectionId}`);
  }
);

// delete collection
collectionRouter.post(
  "/:collectionId/delete",
  validateIdAndAuthorization,
  async (req, res) => {
    const { collectionId } = res.locals;
    const { safeToDelete } = req.body;
    const user = req.session.user._id;

    if (!safeToDelete || safeToDelete !== "on") {
      return res.status(400).redirect(`/collection/${collectionId}/edit`);
    }

    if (!req.session.user.collections.includes(collectionId)) {
      return res.status(400).redirect("/");
    }

    await UserModel.findByIdAndUpdate(user, {
      $pull: { collections: collectionId },
    });
    req.session.user.collections = req.session.user.collections.filter(
      (item) => {
        return item !== collectionId;
      }
    );

    await CollectionModel.findByIdAndDelete(collectionId);

    return res.status(200).redirect("/collection");
  }
);

module.exports = collectionRouter;
