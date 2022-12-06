var express = require("express");
var router = express.Router();

// Require our controllers.
var model_controller = require("../controllers/modelController");
var brand_controller = require("../controllers/brandController");
var biketype_controller = require("../controllers/biketypeController");

/// MODEL ROUTES ///

// GET catalog home page.
router.get("/", model_controller.index);

// GET request for creating a Model. NOTE This must come before routes that display Model (uses id).
router.get("/model/create", model_controller.model_create_get);

// POST request for creating Model.
router.post("/model/create", model_controller.model_create_post);

// GET request to delete Model.
router.get("/model/:id/delete", model_controller.model_delete_get);

// POST request to delete Model.
router.post("/model/:id/delete", model_controller.model_delete_post);

// GET request to update Model.
router.get("/model/:id/update", model_controller.model_update_get);

// POST request to update Model.
router.post("/model/:id/update", model_controller.model_update_post);

// GET request for one Model.
router.get("/model/:id", model_controller.model_detail);

// GET request for list of all Model.
router.get("/models", model_controller.model_list);

/// Brand ROUTES ///

// GET request for creating Brand. NOTE This must come before route for id (i.e. display brand).
router.get("/brand/create", brand_controller.brand_create_get);

// POST request for creating Brand.
router.post("/brand/create", brand_controller.brand_create_post);

// GET request to delete Brand.
router.get("/brand/:id/delete", brand_controller.brand_delete_get);

// POST request to delete brand
router.post("/brand/:id/delete", brand_controller.brand_delete_post);

// GET request to update brand.
router.get("/brand/:id/update", brand_controller.brand_update_get);

// POST request to update brand.
router.post("/brand/:id/update", brand_controller.brand_update_post);

// GET request for one Brand.
router.get("/brand/:id", brand_controller.brand_detail);

// GET request for list of all Brands.
router.get("/brands", brand_controller.brand_list);

/// BIKETYPE ROUTES ///

// GET request for creating a BikeType. NOTE This must come before route that displays BikeType (uses id).
router.get("/biketype/create", biketype_controller.biketype_create_get);

// POST request for creating BikeType.
router.post("/biketype/create", biketype_controller.biketype_create_post);

// GET request to delete BikeType.
router.get("/biketype/:id/delete", biketype_controller.biketype_delete_get);

// POST request to delete BikeType.
router.post("/biketype/:id/delete", biketype_controller.biketype_delete_post);

// GET request to update BikeType.
router.get("/biketype/:id/update", biketype_controller.biketype_update_get);

// POST request to update BikeType.
router.post("/biketype/:id/update", biketype_controller.biketype_update_post);

// GET request for one BikeType.
router.get("/biketype/:id", biketype_controller.biketype_detail);

// GET request for list of all BikeType.
router.get("/biketypes", biketype_controller.biketype_list);

module.exports = router;
