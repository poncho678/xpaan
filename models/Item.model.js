const { Schema, model, mongoose } = require("mongoose");

const itemSchema = new Schema(
  {
    title: {
      type: String,
    },
    img: {
      type: String,
    },
    imgUrl: {
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
    collectionId: {
      type: mongoose.Types.ObjectId,
      ref: "Collection",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["text", "url", "img-url", "img"],
    },
  },
  {
    timestamps: true,
  }
);

const Item = model("Item", itemSchema);

module.exports = Item;
