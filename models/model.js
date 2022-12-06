var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ModelSchema = new Schema({
  model_name: { type: String, required: true },
  brand: { type: Schema.ObjectId, ref: "Brand", required: true },
  power: { type: String, required: true },
  yt_url: { type: String, required: true },
  biketype: [{ type: Schema.ObjectId, ref: "BikeType" }],
});

// Virtual for this model instance URL.
ModelSchema.virtual("url").get(function () {
  return "/catalog/model/" + this._id;
});

// Export model.
module.exports = mongoose.model("Model", ModelSchema);
