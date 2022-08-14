const { Schema, model, mongoose } = require("mongoose");

const collectionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    isTodoList: {
      type: Boolean,
      default: false,
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
