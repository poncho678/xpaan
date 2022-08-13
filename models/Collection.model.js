const { Schema, model, mongoose } = require("mongoose");

const collectionSchema = new Schema(
  {
    name: {
      type: String,
    },
    isTodoList: {
      type: Boolean,
    },
    items: [
      {
        type: mongoose.Types.ObjectId,
        ref: "item",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Collection = model("Collection", collectionSchema);

module.exports = Collection;
