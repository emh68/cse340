// Needed Resources 
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")

// Login view route
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Registration view route
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to update database with registration data
router.post('/register', utilities.handleErrors(accountController.registerAccount))

module.exports = router;