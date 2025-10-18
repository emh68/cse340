// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const baseController = require("../controllers/baseController")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build details by inventory ID
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));

// Temporary route to intentionally trigger a 500 error for testing
router.get("/trigger-error", utilities.handleErrors(baseController.triggerError));


module.exports = router;