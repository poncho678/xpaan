const express = require("express");
const { isValidObjectId } = require("mongoose");
const collectionRouter = express.Router();
const CollectionModel = require("../models/Collection.model");
const UserModel = require("../models/User.model");

collectionRouter.get("/", async (req, res) => {
  const currentUser = await UserModel.findById(req.session.user._id);
  const collections = await CollectionModel.find({
    _id: { $in: currentUser.collections },
  });
  res.render("collection/home", { collections });
});

// create a collection
collectionRouter.get("/create", (req, res) => {
  res.render("collection/create");
});
collectionRouter.post("/create", async (req, res) => {
  let { name, description, isTodoList } = req.body;
  isTodoList = isTodoList === "on" ? true : false;

  if (!name) {
    // maybe include error message...
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

  res.redirect(`/collection/${createdCollection._id}`);
});

collectionRouter.get("/:collectionId", async (req, res) => {
  const { collectionId } = req.params;
  const isValidCollectionId = isValidObjectId(collectionId);
  if (!isValidCollectionId) {
    return res.status(404).redirect("/collection");
  }

  const possibleCollection = await CollectionModel.findById(collectionId);
  const { name, description, items, isTodoList, _id } = possibleCollection;

  if (!possibleCollection) {
    return res.status(404).redirect("/collection");
  }

  res.render("collection/view", { name, description, items, isTodoList, _id });
});

// edit collection
collectionRouter.get("/:collectionId/edit", async (req, res) => {
  const { collectionId } = req.params;
  const isValidCollectionId = isValidObjectId(collectionId);
  if (!isValidCollectionId) {
    return res.status(404).redirect("/collection");
  }
  const collection = await CollectionModel.findById(collectionId);
  const { name, description, items, isTodoList, _id } = collection;
  res.render("collection/edit", { name, description, items, isTodoList, _id });
});
collectionRouter.post("/:collectionId/edit", async (req, res) => {
  const { collectionId } = req.params;
  const isValidCollectionId = isValidObjectId(collectionId);
  if (!isValidCollectionId) {
    return res.status(404).redirect("/collection");
  }
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
});

// delete collection

module.exports = collectionRouter;
