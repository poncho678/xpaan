const { Schema, model, mongoose } = require("mongoose");

const itemSchema = new Schema(
  {
    title: {
      type: String,
    },
    image: {
      type: String,
    },
    image_url: {
      type: String,
    },
    url: {
      type: String,
    },
    text: {
      type: String,
    },
    notes: [
      {
        type: String,
      },
    ],
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Item = model("Item", itemSchema);

module.exports = Item;
