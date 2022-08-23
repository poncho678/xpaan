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
    ("y");
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
    console.log("item not found");
    res.status(400).redirect(`/collection/${collectionId}`);
  }

  res.render("item/view", { item });
});

// edit Item
itemRouter.get("/:itemId/edit", (req, res) => {});

// delete Item
itemRouter.get("/:itemId/delete", isLoggedIn, async (req, res) => {
  const { itemId, collectionId } = req.params;

  if (!isValidObjectId(itemId) || !isValidObjectId(collectionId)) {
    res.redirect(`/collection/${collectionId}/`);
  }

  await ItemModel.findByIdAndDelete(itemId);
  await CollectionModel.findByIdAndUpdate(collectionId, {
    $pull: { items: itemId },
  });

  res.redirect(`/collection/${collectionId}`);
});

// move to different Collection???

module.exports = itemRouter;
