const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")

/*  **********************************
*  Registration Data Validation Rules
* ********************************* */
validate.registrationRules = () => {
    return [

        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."),

        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."),

        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists) {
                    throw new Error("Email exists. Please log in or use different email")
                }
            }),

        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ]
}

/* **************************
 * Check Registration Data
 * ************************* */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

/* ******************************
 *  Login Data Validation Rules
 * ****************************** */
validate.loginRules = () => {
    return [
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail()
            .withMessage("Please enter a valid email address."),

        body("account_password")
            .trim()
            .notEmpty()
            .withMessage("Please enter your password."),
    ]
}

/* *****************
 * Check Login Data
 * ***************** */
validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email,
        })
        return
    }
    next()
}

/* **************************************
 * Update Account Validation Rules
 * ************************************** */
validate.updateAccountRules = () => {
    return [
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("First name is required."),
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Last name is required."),
        body("account_email")
            .trim()
            .normalizeEmail()
            .isEmail()
            .withMessage("A valid email is required."),
    ]
}

validate.checkUpdateData = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        return res.render("account/update-account", {
            title: "Edit Account",
            nav,
            accountData: req.body,
            errors: errors.array(),
        })
    }
    next()
}

/* **************************************
 * Password Validation Rules
 * ************************************** */
validate.passwordRules = () => {
    return [
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage(
                "Password must be at least 12 characters and include uppercase, lowercase, number, and symbol."
            ),
    ]
}

validate.checkPasswordData = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        return res.render("account/update-account", {
            title: "Edit Account",
            nav,
            accountData: req.body,
            errors: errors.array(),
        })
    }
    next()
}

module.exports = validate