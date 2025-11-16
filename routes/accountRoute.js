// Needed Resources 
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation');


// Login view route
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Registration view route
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Route to update database with registration data
router.post("/register", regValidate.registrationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount));

// Process the login attempt
router.post("/login", regValidate.loginRules(), regValidate.checkLoginData, utilities.handleErrors(accountController.accountLogin));

// Account
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount));

module.exports = router;