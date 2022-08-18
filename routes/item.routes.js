const express = require("express");
const { isValidObjectId } = require("mongoose");
const itemRouter = express.Router({ mergeParams: true });
const CollectionModel = require("../models/Collection.model");
const UserModel = require("../models/User.model");
const ItemModel = require("../models/Item.model");

// create Item
itemRouter.get("/create", (req, res) => {
  const { collectionId } = req.params;
  res.render("item/create", { collectionId });
});
itemRouter.post("/create", async (req, res) => {
  console.log(req.params);
});

// view Item
itemRouter.get("/:itemId", async (req, res) => {});

// edit Item
itemRouter.get("/:itemId/edit", (req, res) => {});

// delete Item

// move to different Collection???

module.exports = itemRouter;
