var Model = require("../models/model");
var Brand = require("../models/brand");
var BikeType = require("../models/biketype");

const { body, validationResult } = require("express-validator");

var async = require("async");

exports.index = function (req, res) {
  async.parallel(
    {
      model_count: function (callback) {
        Model.countDocuments({}, callback);
      },
      brand_count: function (callback) {
        Brand.countDocuments({}, callback);
      },
      biketype_count: function (callback) {
        BikeType.countDocuments({}, callback);
      },
    },
    function (err, results) {
      res.render("index", {
        title: "Local Library Home",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all models.
exports.model_list = function (req, res, next) {
  Model.find({}, "model_name brand")
    .sort({ model_name: 1 })
    .populate("brand")
    .exec(function (err, list_models) {
      if (err) {
        return next(err);
      } else {
        // Successful, so render
        res.render("model_list", { title: "Model List", model_list: list_models });
      }
    });
};

// Display detail page for a specific model.
exports.model_detail = function (req, res, next) {
  async.parallel(
    {
      model: function (callback) {
        Model.findById(req.params.id)
            .populate("brand")
            .populate("biketype")
            .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.model == null) {
        // No results.
        var err = new Error("Model not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("model_detail", {
        model_name: results.model.model_name,
        model: results.model,
      });
    }
  );
};

// Display model create form on GET.
exports.model_create_get = function (req, res, next) {
  // Get all brands and biketypes, which we can use for adding to our model.
  async.parallel(
    {
      brands: function (callback) {
        Brand.find(callback);
      },
      biketypes: function (callback) {
        BikeType.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      res.render("model_form", {
        title: "Create Model",
        brands: results.brands,
        biketypes: results.biketypes,
      });
    }
  );
};

// Handle model create on POST.
exports.model_create_post = [
  // Convert the biketype to an array.
  (req, res, next) => {
    if (!(req.body.biketype instanceof Array)) {
      if (typeof req.body.biketype === "undefined") req.body.biketype = [];
      else req.body.biketype = new Array(req.body.biketype);
    }
    next();
  },

  // Validate and sanitize fields.
  body("model_name", "Model must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("brand", "Brand must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("power", "Power must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("yt_url").trim().isLength({ min: 1 }),
  body("biketype.*").escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Model object with escaped and trimmed data.
    var model = new Model({
      model_name: req.body.model_name,
      brand: req.body.brand,
      power: req.body.power,
      yt_url: req.body.yt_url,
      biketype: req.body.biketype,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all brands and biketypes for form.
      async.parallel(
        {
          brands: function (callback) {
            Brand.find(callback);
          },
          biketypes: function (callback) {
            BikeType.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          // Mark our selected biketypes as checked.
          for (let i = 0; i < results.biketypes.length; i++) {
            if (model.biketype.indexOf(results.biketypes[i]._id) > -1) {
              results.biketypes[i].checked = "true";
            }
          }
          res.render("model_form", {
            title: "Create Model",
            brands: results.brands,
            biketypes: results.biketypes,
            model: model,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Save model.
      model.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new model record.
        res.redirect(model.url);
      });
    }
  },
];

// Display model delete form on GET.
exports.model_delete_get = function (req, res, next) {
  async.parallel(
    {
      model: function (callback) {
        Model.findById(req.params.id)
          .populate("brand")
          .populate("biketype")
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.model == null) {
        // No results.
        res.redirect("/catalog/models");
      }
      // Successful, so render.
      res.render("model_delete", {
        title: "Delete Model",
        model: results.model,
      });
    }
  );
};

// Handle model delete on POST.
exports.model_delete_post = function (req, res, next) {
  // Assume the post has valid id (ie no validation/sanitization).

  async.parallel(
    {
      model: function (callback) {
        Model.findById(req.body.id)
          .populate("brand")
          .populate("biketype")
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
    Model.findByIdAndRemove(req.body.id, function deleteModel(err) {
        if (err) {
            return next(err);
          }
        // Success - got to models list.
        res.redirect("/catalog/models");
    });
    }
  );
};

// Display model update form on GET.
exports.model_update_get = function (req, res, next) {
  // Get model, brands and biketypes for form.
  async.parallel(
    {
      model: function (callback) {
        Model.findById(req.params.id)
          .populate("brand")
          .populate("biketype")
          .exec(callback);
      },
      brands: function (callback) {
        Brand.find(callback);
      },
      biketypes: function (callback) {
        BikeType.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.model == null) {
        // No results.
        var err = new Error("Model not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected biketypes as checked.
      for (
        var all_g_iter = 0;
        all_g_iter < results.biketypes.length;
        all_g_iter++
      ) {
        for (
          var model_g_iter = 0;
          model_g_iter < results.model.biketype.length;
          model_g_iter++
        ) {
          if (
            results.biketypes[all_g_iter]._id.toString() ===
            results.model.biketype[model_g_iter]._id.toString()
          ) {
            results.biketypes[all_g_iter].checked = "true";
          }
        }
      }
      res.render("model_form", {
        title: "Update Model",
        brands: results.brands,
        biketypes: results.biketypes,
        model: results.model,
      });
    }
  );
};

// Handle model update on POST.
exports.model_update_post = [
  // Convert the biketype to an array.
  (req, res, next) => {
    if (!(req.body.biketype instanceof Array)) {
      if (typeof req.body.biketype === "undefined") req.body.biketype = [];
      else req.body.biketype = new Array(req.body.biketype);
    }
    next();
  },

  // Validate and sanitize fields.
  body("model", "Model must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("brand", "brand must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("power", "Power must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("yt_url").trim().isLength({ min: 1 }).escape(),
  body("biketype.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a model object with escaped/trimmed data and old id.
    var model = new Model({
      model_name: req.body.model_name,
      brand: req.body.brand,
      power: req.body.power,
      yt_url: req.body.yt_url,
      biketype: typeof req.body.biketype === "undefined" ? [] : req.body.biketype,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all brands and biketypes for form
      async.parallel(
        {
          brands: function (callback) {
            Brand.find(callback);
          },
          biketypes: function (callback) {
            BikeType.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          // Mark our selected biketypes as checked.
          for (let i = 0; i < results.biketypes.length; i++) {
            if (model.biketype.indexOf(results.biketypes[i]._id) > -1) {
              results.biketypes[i].checked = "true";
            }
          }
          res.render("model_form", {
            title: "Update Model",
            brands: results.brands,
            biketypes: results.biketypes,
            model: model,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid. Update the record.
      Model.findByIdAndUpdate(req.params.id, model, {}, function (err, themodel) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to model detail page.
        res.redirect(themodel.url);
      });
    }
  },
];
