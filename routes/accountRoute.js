// Needed Resources 
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation');
const accountValidate = require('../utilities/account-validation');


// Login view route
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Registration view route
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Route to update database with registration data
router.post("/register", regValidate.registrationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerAccount));

// Validate login
router.post("/login", regValidate.loginRules(), regValidate.checkLoginData, utilities.handleErrors(accountController.accountLogin));

// Process login 
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount));

// Process logout
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

// Route for building update form
router.get("/update/:account_id", utilities.checkLogin, accountController.buildUpdateForm);

// Route to process and update account
router.post("/update", accountValidate.updateAccountRules(), accountValidate.checkUpdateData, accountController.updateAccount);

// Route to update and change password
router.post("/change-password", accountValidate.passwordRules(), accountValidate.checkPasswordData, accountController.changePassword);

module.exports = router;