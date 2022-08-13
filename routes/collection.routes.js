const express = require("express");
const collectionRouter = express.Router();
const CollectionModel = require("../models/Collection.model");
const UserModel = require("../models/User.model");

collectionRouter.get("/", (req, res) => {
  // get all collections for user...
  res.render("collection/home");
});

// create a collection
collectionRouter.get("/create", (req, res) => {
  res.render("collection/create");
});
collectionRouter.post("/create", (req, res) => {
  // reg.body....
});

// edit collection

// delete collection

module.exports = collectionRouter;
