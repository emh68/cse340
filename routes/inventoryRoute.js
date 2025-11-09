// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const baseController = require("../controllers/baseController")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build details by inventory ID
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));

// Temporary route to intentionally trigger a 500 error for testing
router.get("/trigger-error", utilities.handleErrors(baseController.triggerError));

// Management view route
router.get("/", utilities.handleErrors(invController.buildManagement));

// Display Add Classification form
router.get('/add-classification', utilities.handleErrors(invController.buildAddClassification));

// Handle form submission
router.post('/add-classification', invValidate.classificationRules(), invValidate.checkClassificationData, utilities.handleErrors(invController.addClassification));

// Display Add Inventory Form
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventoryView));

// Handle Add Inventory form submission
router.post("/add-inventory", invValidate.inventoryRules(), invValidate.checkInventoryData, utilities.handleErrors(invController.addInventory));

module.exports = router;