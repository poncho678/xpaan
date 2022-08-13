const { Schema, model } = require("mongoose");

const itemSchema = new Schema({
  title: {
    type: String,
  },
  image: {
    type: String,
  },
  url: {
    type: String,
  },
});

const Item = model("Item", itemSchema);

module.exports = Item;
