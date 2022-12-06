var BikeType = require("../models/biketype");
var Model = require("../models/model");
var async = require("async");

const { body, validationResult } = require("express-validator");

// Display list of all BikeType.
exports.biketype_list = function (req, res, next) {
  BikeType.find()
    .sort([["name", "ascending"]])
    .exec(function (err, list_biketypes) {
      if (err) {
        return next(err);
      }
      // Successful, so render.
      res.render("biketype_list", {
        title: "BikeType List",
        list_biketypes: list_biketypes,
      });
    });
};

// Display detail page for a specific BikeType.
exports.biketype_detail = function (req, res, next) {
  async.parallel(
    {
      biketype: function (callback) {
        BikeType.findById(req.params.id)
            .populate("brand")
            .exec(callback);
      },

      biketype_models: function (callback) {
        Model.find({ biketype: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.biketype == null) {
        // No results.
        var err = new Error("BikeType not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("biketype_detail", {
        title: "BikeType Detail",
        biketype: results.biketype,
        biketype_models: results.biketype_models,
      });
    }
  );
};

// Display BikeType create form on GET.
exports.biketype_create_get = function (req, res, next) {
  res.render("biketype_form", { title: "Create BikeType" });
};

// Handle BikeType create on POST.
exports.biketype_create_post = [
  // Validate and santize the name field.
  body("name", "BikeType name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a biketype object with escaped and trimmed data.
    var biketype = new BikeType({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("biketype_form", {
        title: "Create BikeType",
        biketype: biketype,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if BikeType with same name already exists.
      BikeType.findOne({ name: req.body.name }).exec(function (err, found_biketype) {
        if (err) {
          return next(err);
        }

        if (found_biketype) {
          // BikeType exists, redirect to its detail page.
          res.redirect(found_biketype.url);
        } else {
          biketype.save(function (err) {
            if (err) {
              return next(err);
            }
            // BikeType saved. Redirect to biketype detail page.
            res.redirect(biketype.url);
          });
        }
      });
    }
  },
];

// Display BikeType delete form on GET.
exports.biketype_delete_get = function (req, res, next) {
  async.parallel(
    {
      biketype: function (callback) {
        BikeType.findById(req.params.id).exec(callback);
      },
      biketype_models: function (callback) {
        Model.find({ biketype: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.biketype == null) {
        // No results.
        res.redirect("/catalog/biketypes");
      }
      // Successful, so render.
      res.render("biketype_delete", {
        title: "Delete BikeType",
        biketype: results.biketype,
        biketype_models: results.biketype_models,
      });
    }
  );
};

// Handle BikeType delete on POST.
exports.biketype_delete_post = function (req, res, next) {
  async.parallel(
    {
      biketype: function (callback) {
        BikeType.findById(req.params.id).exec(callback);
      },
      biketype_models: function (callback) {
        Model.find({ biketype: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success
      if (results.biketype_models.length > 0) {
        // BikeType has models. Render in same way as for GET route.
        res.render("biketype_delete", {
          title: "Delete BikeType",
          biketype: results.biketype,
          biketype_models: results.biketype_models,
        });
        return;
      } else {
        // BikeType has no models. Delete object and redirect to the list of biketypes.
        BikeType.findByIdAndRemove(req.body.id, function deleteBikeType(err) {
          if (err) {
            return next(err);
          }
          // Success - go to biketypes list.
          res.redirect("/catalog/biketypes");
        });
      }
    }
  );
};

// Display BikeType update form on GET.
exports.biketype_update_get = function (req, res, next) {
  BikeType.findById(req.params.id, function (err, biketype) {
    if (err) {
      return next(err);
    }
    if (biketype == null) {
      // No results.
      var err = new Error("BikeType not found");
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render("biketype_form", { title: "Update BikeType", biketype: biketype });
  });
};

// Handle BikeType update on POST.
exports.biketype_update_post = [
  // Validate and sanitze the name field.
  body("name", "BikeType name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request .
    const errors = validationResult(req);

    // Create a biketype object with escaped and trimmed data (and the old id!)
    var biketype = new BikeType({
      name: req.body.name,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values and error messages.
      res.render("biketype_form", {
        title: "Update BikeType",
        biketype: biketype,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      BikeType.findByIdAndUpdate(
        req.params.id,
        biketype,
        {},
        function (err, thebiketype) {
          if (err) {
            return next(err);
          }
          // Successful - redirect to biketype detail page.
          res.redirect(thebiketype.url);
        }
      );
    }
  },
];
