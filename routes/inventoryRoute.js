// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const baseController = require("../controllers/baseController")
const invValidate = require("../utilities/inventory-validation")
const employeeAuth = require("../utilities/employeeAuth")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build details by inventory ID
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));

// Temporary route to intentionally trigger a 500 error for testing
router.get("/trigger-error", utilities.handleErrors(baseController.triggerError));

// Management view route
router.get("/", employeeAuth, utilities.handleErrors(invController.buildManagement));

// Display Add Classification form
router.get('/add-classification', employeeAuth, utilities.handleErrors(invController.buildAddClassification));

// Handle form submission
router.post('/add-classification', employeeAuth, invValidate.classificationRules(), invValidate.checkClassificationData, utilities.handleErrors(invController.addClassification));

// Display Add Inventory Form
router.get("/add-inventory", employeeAuth, utilities.handleErrors(invController.buildAddInventoryView));

// Handle Add Inventory form submission
router.post("/add-inventory", employeeAuth, invValidate.inventoryRules(), invValidate.checkInventoryData, utilities.handleErrors(invController.addInventory));

// Route for management inventory selection
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to display the edit form for an inventory item
router.get("/edit/:invId", employeeAuth, utilities.handleErrors(invController.editInventoryView));

// Route to handle inventory update
router.post("/update", employeeAuth, invValidate.updateRules(), invValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory));

// Deliver the delete confirmation view
router.get('/delete/:inv_id', employeeAuth, utilities.handleErrors(invController.buildDeleteView));

// Process the deletion
router.post('/delete', employeeAuth, utilities.handleErrors(invController.deleteInventoryItem));

module.exports = router;