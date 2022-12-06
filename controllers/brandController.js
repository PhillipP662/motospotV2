var Brand = require("../models/brand");
var async = require("async");
var Model = require("../models/model");

const { body, validationResult } = require("express-validator");

// Display list of all Brands.
exports.brand_list = function (req, res, next) {
  Brand.find()
    .sort([["brand_name", "ascending"]])
    .exec(function (err, list_brands) {
      if (err) {
        return next(err);
      }
      // Successful, so render.
      res.render("brand_list", {
        title: "Brand List",
        brand_list: list_brands,
      });
    });
};

// Display detail page for a specific Brand.
exports.brand_detail = function (req, res, next) {
  async.parallel(
    {
      brand: function (callback) {
        Brand.findById(req.params.id).exec(callback);
      },
      brands_models: function (callback) {
        Model.find({ brand: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      } // Error in API usage.
      if (results.brand == null) {
        // No results.
        var err = new Error("Brand not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("brand_detail", {
        title: "Brand Detail",
        brand: results.brand,
        brand_models: results.brands_models,
      });
    }
  );
};

// Display Brand create form on GET.
exports.brand_create_get = function (req, res, next) {
  res.render("brand_form", { title: "Create Brand" });
};

// Handle Brand create on POST.
exports.brand_create_post = [
  // Validate and sanitize fields.
  body("brand_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Brand name must be specified.")
    .isAlphanumeric()
    .withMessage("Brand name has non-alphanumeric characters."),
  body("founding_date", "Invalid founding date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Brand object with escaped and trimmed data
    var brand = new Brand({
      brand_name: req.body.brand_name,
      founding_date: req.body.founding_date,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("brand_form", {
        title: "Create Brand",
        brand: brand,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save brand.
      brand.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new brand record.
        res.redirect(brand.url);
      });
    }
  },
];

// Display Brand delete form on GET.
exports.brand_delete_get = function (req, res, next) {
  async.parallel(
    {
      brand: function (callback) {
        Brand.findById(req.params.id).exec(callback);
      },
      brands_models: function (callback) {
        Model.find({ brand: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.brand == null) {
        // No results.
        res.redirect("/catalog/brands");
      }
      // Successful, so render.
      res.render("brand_delete", {
        title: "Delete brand",
        brand: results.brand,
        brand_models: results.brands_models,
      });
    }
  );
};

// Handle Brand delete on POST.
exports.brand_delete_post = function (req, res, next) {
  async.parallel(
    {
      brand: function (callback) {
        Brand.findById(req.body.brandid).exec(callback);
      },
      brands_models: function (callback) {
        Model.find({ brand: req.body.brandid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success.
      if (results.brands_models.length > 0) {
        // Brand has models. Render in same way as for GET route.
        res.render("brand_delete", {
          title: "Delete Brand",
          brand: results.brand,
          brand_models: results.brands_models,
        });
        return;
      } else {
        // Brand has no models. Delete object and redirect to the list of brands.
        Brand.findByIdAndRemove(req.body.brandid, function deleteBrand(err) {
          if (err) {
            return next(err);
          }
          // Success - go to brand list.
          res.redirect("/catalog/brands");
        });
      }
    }
  );
};

// Display Brand update form on GET.
exports.brand_update_get = function (req, res, next) {
  Brand.findById(req.params.id, function (err, brand) {
    if (err) {
      return next(err);
    }
    if (brand == null) {
      // No results.
      var err = new Error("Brand not found");
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render("brand_form", { title: "Update Brand", brand: brand });
  });
};

// Handle Brand update on POST.
exports.brand_update_post = [
  // Validate and santize fields.
  body("brand_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Brand name must be specified.")
    .isAlphanumeric()
    .withMessage("Brand name has non-alphanumeric characters."),
  body("founding_date", "Invalid founding date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Brand object with escaped and trimmed data (and the old id!)
    var brand = new Brand({
      brand_name: req.body.brand_name,
      founding_date: req.body.founding_date,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values and error messages.
      res.render("brand_form", {
        title: "Update Brand",
        brand: brand,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      Brand.findByIdAndUpdate(
        req.params.id,
        brand,
        {},
        function (err, thebrand) {
          if (err) {
            return next(err);
          }
          // Successful - redirect to biketype detail page.
          res.redirect(thebrand.url);
        }
      );
    }
  },
];
