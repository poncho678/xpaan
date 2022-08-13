const { Schema, model } = require("mongoose");

const collectionSchema = new Schema({
  name: {
    type: String,
  },
  items: [
    {
      type: mongoose.Types.ObjectId,
      ref: "item",
    },
  ],
});

const Collection = model("Collection", collectionSchema);

module.exports = Collection;
