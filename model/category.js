const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your category name!"],
  },

  image: {
    type: String,
    required: [true, "Please upload your category image!"],
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Category", categorySchema);
