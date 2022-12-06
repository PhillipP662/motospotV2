var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var BikeTypeSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
});

// Virtual for this biketype instance URL.
BikeTypeSchema.virtual("url").get(function () {
  return "/catalog/biketype/" + this._id;
});

// Export model.
module.exports = mongoose.model("BikeType", BikeTypeSchema);
