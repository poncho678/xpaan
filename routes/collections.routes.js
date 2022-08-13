const express = require("express");
const collectionsRouter = express.Router();
const CollectionsModel = require("../models/Collection.model");
const UserModel = require("../models/User.model");

module.exports = collectionsRouter;
