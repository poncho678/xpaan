const express = require("express");
const itemRouter = express.Router({ mergeParams: true });
const { isValidObjectId } = require("mongoose");
const ogs = require("open-graph-scraper");

// required for image upload
const { v2: cloudinary } = require("cloudinary");
const { cloudinaryFolder } = require("../utils/consts");

// middleware
const uploadMiddleware = require("../middleware/cloudinary");
const isLoggedIn = require("../middleware/isLoggedIn");

// models
const CollectionModel = require("../models/Collection.model");
const UserModel = require("../models/User.model");
const ItemModel = require("../models/Item.model");

// Run this before every Route
itemRouter.use(isLoggedIn);

// create Item
itemRouter.get("/create", (req, res) => {
  const { collectionId } = req.params;
  res.render("item/create", { collectionId });
});
//image route form
itemRouter.post(
  "/create-img",
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
itemRouter.post("/create-img-url", async (req, res) => {
  const { collectionId } = req.params;
  const { title, text, imgUrl } = req.body;
  const { type } = req.query;

  // if no file is selected... return.
  if (!imgUrl) {
    return res.status(400).render("item/create", { collectionId, title, text });
  }

  const newImage = await cloudinary.uploader.upload(imgUrl, {
    folder: cloudinaryFolder,
  });

  const createItem = await ItemModel.create({
    title,
    text,
    img: newImage.url ? newImage.url : imgUrl,
    type,
    collectionId,
  });

  await CollectionModel.findByIdAndUpdate(collectionId, {
    $push: { items: createItem._id },
  });

  res.redirect(`/collection/${collectionId}/item/${createItem._id}`);
});
// text form
itemRouter.post("/create-text", async (req, res) => {
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
itemRouter.post("/create-url", async (req, res) => {
  const { collectionId } = req.params;
  const { title, url } = req.body;
  const { type } = req.query;

  // if no file is selected... return.
  if (!url) {
    return res.status(400).render("item/create", { collectionId, title, text });
  }

  const options = { url: url, timeout: 50000, downloadLimit: 10000000000 };
  let {
    img = "",
    text = "",
    ogTitle = "",
  } = await ogs(options, (error, results, response) => {
    if (error) {
      return { img: "", text: "" };
    }
    return {
      img: results.ogImage.url,
      text: results.ogDescription,
      ogTitle: results.ogTitle,
    };
  });

  if (img) {
    const newImage = await cloudinary.uploader.upload(img, {
      folder: cloudinaryFolder,
    });
    img = newImage.url;
  }

  const createItem = await ItemModel.create({
    title: title ? title : ogTitle ? ogTitle : url,
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
itemRouter.get("/:itemId", async (req, res) => {
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
itemRouter.post("/:itemId/edit", async (req, res) => {
  const { collectionId, itemId } = req.params;
  if (!isValidObjectId(collectionId) || !isValidObjectId(itemId)) {
    return res.status(400).redirect("/");
  }
  const item = await ItemModel.findById(itemId);

  if (!item) {
    return res.status(400).redirect(`/collection/${collectionId}/`);
  }
  if (!req.session.user.collections.includes(collectionId)) {
    return res.status(400).redirect("/");
  }

  const { title, text, url, img } = req.body;

  await ItemModel.findByIdAndUpdate(itemId, { title, text, url, img });

  res.redirect(`/collection/${collectionId}/item/${itemId}`);
});

// delete Item
itemRouter.post("/:itemId/delete", async (req, res) => {
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

  const { img } = await ItemModel.findById(itemId);
  if (img) {
    const public_id = img.slice(
      img.indexOf(cloudinaryFolder),
      img.lastIndexOf(".")
    );
    await cloudinary.uploader.destroy(public_id, function (error, result) {
      console.log(result, error);
    });
  }

  await ItemModel.findByIdAndDelete(itemId);
  await CollectionModel.findByIdAndUpdate(collectionId, {
    $pull: { items: itemId },
  });

  res.redirect(`/collection/${collectionId}`);
});

itemRouter.post("/:itemId/update-status", async (req, res) => {
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
