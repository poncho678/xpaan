const express = require("express");
const { isValidObjectId } = require("mongoose");
const itemRouter = express.Router({ mergeParams: true });
const CollectionModel = require("../models/Collection.model");
const UserModel = require("../models/User.model");
const ItemModel = require("../models/Item.model");
const uploadMiddleware = require("../middleware/cloudinary");

// create Item
itemRouter.get("/create", (req, res) => {
  const { collectionId } = req.params;

  res.render("item/create", { collectionId });
});
itemRouter.post(
  "/create-img",
  uploadMiddleware.single("img"),
  async (req, res) => {
    const { collectionId } = req.params;
    const { type } = req.query;
    const { path: img } = req.file;
    const { title, text } = req.body;

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

// view Item
itemRouter.get("/:itemId", async (req, res) => {
  const { itemId, collectionId } = req.params;

  const theItem = ItemModel.findById(itemId);

  if (!theItem) {
    console.log("item not found");
    res.status(400).redirect(`/collection/${collectionId}`);
  }

  console.log("item found, but no page available");

  //   find item in model...

  res.render("item/view");
});

// edit Item
itemRouter.get("/:itemId/edit", (req, res) => {});

// delete Item

// move to different Collection???

module.exports = itemRouter;
