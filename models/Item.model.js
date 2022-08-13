const { Schema, model } = require("mongoose");

const itemSchema = new Schema({
  title: {
    type: String,
  },
});

const Item = model("Item", itemSchema);

module.exports = Item;
