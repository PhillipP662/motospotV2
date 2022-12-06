var mongoose = require("mongoose");
const { DateTime } = require("luxon"); // for date handling

var Schema = mongoose.Schema;

var BrandSchema = new Schema({
  brand_name: { type: String, required: true, maxLength: 100 },
  founding_date: { type: Date },
});

// Virtual for brand "full" name.
BrandSchema.virtual("name").get(function () {
  return this.brand_name;
});

// Virtual for this brand instance URL.
BrandSchema.virtual("url").get(function () {
  return "/catalog/brand/" + this._id;
});

BrandSchema.virtual("lifespan").get(function () {
  var lifetime_string = "";
  if (this.founding_date) {
    lifetime_string = DateTime.fromJSDate(this.founding_date).toLocaleString(
      DateTime.DATE_MED
    );
  }
  return lifetime_string;
});

BrandSchema.virtual("founding_date_yyyy_mm_dd").get(function () {
  return DateTime.fromJSDate(this.founding_date).toISODate(); // format 'YYYY-MM-DD'
});

// Export model.
module.exports = mongoose.model("Brand", BrandSchema);
