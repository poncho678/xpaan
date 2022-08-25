const express = require("express");
const { isValidObjectId } = require("mongoose");
const uploadMiddleware = require("../middleware/cloudinary");
const itemRouter = express.Router({ mergeParams: true });
const ogs = require("open-graph-scraper");
const CollectionModel = require("../models/Collection.model");
const UserModel = require("../models/User.model");
const ItemModel = require("../models/Item.model");
const isLoggedIn = require("../middleware/isLoggedIn");

// create Item
itemRouter.get("/create", (req, res) => {
  const { collectionId } = req.params;
  res.render("item/create", { collectionId });
});
//image route form
itemRouter.post(
  "/create-img",
  isLoggedIn,
  uploadMiddleware.single("img"),
  async (req, res) => {
    const { collectionId } = req.params;
    const { title, text } = req.body;
    const { type } = req.query;

    // if no file is selected... return.
    if (!req.file) {
      return res
        .status(400)
        .render("item/create", { collectionId, title, text });
    }
    const { path: img } = req.file;

    const createItem = await ItemModel.create({
      title,
      text,
      img,
      type,
      collectionId,
    });

    await CollectionModel.findByIdAndUpdate(collectionId, {
      $push: { items: createItem._id },
    });

    res.redirect(`/collection/${collectionId}/item/${createItem._id}`);
  }
);
// image url form
itemRouter.post("/create-img-url", isLoggedIn, async (req, res) => {
  const { collectionId } = req.params;
  const { title, text, imgUrl } = req.body;
  const { type } = req.query;

  // if no file is selected... return.
  if (!imgUrl) {
    return res.status(400).render("item/create", { collectionId, title, text });
  }

  const createItem = await ItemModel.create({
    title,
    text,
    img: imgUrl,
    type,
    collectionId,
  });

  await CollectionModel.findByIdAndUpdate(collectionId, {
    $push: { items: createItem._id },
  });

  res.redirect(`/collection/${collectionId}/item/${createItem._id}`);
});
// text form
itemRouter.post("/create-text", isLoggedIn, async (req, res) => {
  const { collectionId } = req.params;
  const { title, text } = req.body;
  const { type } = req.query;

  // if no file is selected... return.
  if (!text && !title) {
    return res.status(400).render("item/create", { collectionId, title, text });
  }

  const createItem = await ItemModel.create({
    title,
    text,
    type,
    collectionId,
  });

  await CollectionModel.findByIdAndUpdate(collectionId, {
    $push: { items: createItem._id },
  });

  res.redirect(`/collection/${collectionId}/item/${createItem._id}`);
});
// url form
itemRouter.post("/create-url", isLoggedIn, async (req, res) => {
  const { collectionId } = req.params;
  const { title, url } = req.body;
  const { type } = req.query;

  // if no file is selected... return.
  if (!url) {
    return res.status(400).render("item/create", { collectionId, title, text });
  }

  const options = { url: url };
  const { img, text } = await ogs(options, (error, results, response) => {
    return {
      url: results.ogUrl,
      img: results.ogImage.url,
      text: results.ogDescription,
    };
  });

  const createItem = await ItemModel.create({
    title: url,
    text,
    img,
    url,
    type,
    collectionId,
  });

  await CollectionModel.findByIdAndUpdate(collectionId, {
    $push: { items: createItem._id },
  });

  res.redirect(`/collection/${collectionId}/item/${createItem._id}`);
});

// view Item
itemRouter.get("/:itemId", isLoggedIn, async (req, res) => {
  const { itemId, collectionId } = req.params;

  const item = await ItemModel.findById(itemId).populate(
    "collectionId",
    "_id isTodoList"
  );

  if (!item) {
    return res.status(400).redirect(`/collection/${collectionId}`);
  }

  res.render("item/view", { item });
});

// edit Item
itemRouter.get("/:itemId/edit", async (req, res) => {
  const { collectionId, itemId } = req.params;
  if (!isValidObjectId(collectionId) || !isValidObjectId(itemId)) {
    return res.status(400).redirect("/");
  }
  const item = await ItemModel.findById(itemId);

  if (!item) {
    return res.status(400).redirect(`/collection/${collectionId}/`);
  }

  res.render("item/edit", item);
});

// delete Item
itemRouter.post("/:itemId/delete", isLoggedIn, async (req, res) => {
  const { itemId, collectionId } = req.params;
  const { safeToDelete } = req.body;

  if (!isValidObjectId(itemId) || !isValidObjectId(collectionId)) {
    return res.status(400).redirect(`/collection/`);
  }

  if (!req.session.user.collections.includes(collectionId)) {
    return res.status(400).redirect("/");
  }

  if (!safeToDelete || safeToDelete !== "on") {
    return res
      .status(400)
      .redirect(`/collection/${collectionId}/item/${itemId}/edit`);
  }

  await ItemModel.findByIdAndDelete(itemId);
  await CollectionModel.findByIdAndUpdate(collectionId, {
    $pull: { items: itemId },
  });

  res.redirect(`/collection/${collectionId}`);
});

itemRouter.post("/:itemId/update-status", isLoggedIn, async (req, res) => {
  const { collectionId, itemId } = req.params;
  const { todo = false } = req.body;

  if (!isValidObjectId(itemId) || !isValidObjectId(collectionId)) {
    return res.status(400).redirect(`/collection/`);
  }

  if (!req.session.user.collections.includes(collectionId)) {
    return res.status(400).redirect("/");
  }

  await ItemModel.findByIdAndUpdate(itemId, { completed: todo });

  res.status(200).redirect(`/collection/${collectionId}`);
});

module.exports = itemRouter;
