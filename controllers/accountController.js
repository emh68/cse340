const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const reviewModel = require("../models/review-model")
require("dotenv").config()


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null
    })
}

/* ****************************************
*  Deliver Register view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }


    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null
        })
    }
}

/* ****************************************
*  Process Login
* *************************************** */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const payload = { account_id: accountData.account_id, account_firstname: accountData.account_firstname, account_lastname: accountData.account_lastname, account_email: accountData.account_email, account_type: accountData.account_type }
            const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })

            if (process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            req.flash("notice", "You're logged in.")
            return res.redirect("/account/")
        }
        else {
            req.flash("notice", "Please check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        throw new Error('Access Forbidden')
    }
}

/* ****************************************
*  Build Account Management
* *************************************** */
async function buildAccount(req, res) {
    try {
        let nav = await utilities.getNav();
        const accountData = res.locals.accountData;

        let userReviews = [];
        if (accountData) {
            userReviews = await reviewModel.getReviewsByAccountId(accountData.account_id);
        }

        res.render("account/account-management", {
            title: "Account Management",
            nav,
            errors: null,
            accountData,
            userReviews,
            messages: req.flash("notice")
        });
    } catch (error) {
        console.error(error);
        res.status(500).render("errors/500", { error });
    }
}

/* ****************************************
 *  Process Logout
 * *************************************** */
async function accountLogout(req, res) {
    try {
        res.clearCookie("jwt")
        req.flash("notice", "You have been logged out.")
        return res.redirect("/")
    } catch (error) {
        throw new Error("Logout failed")
    }
}

/* ****************************************
 *  Build Update Form
 * *************************************** */
async function buildUpdateForm(req, res, next) {
    try {
        const account_id = req.params.account_id;
        let accountData = await accountModel.getAccountById(account_id);
        const nav = await utilities.getNav();

        if (!accountData) {
            req.flash("notice", "Account not found or cannot be updated.");
            accountData = {};
        }

        res.render("account/update-account", {
            title: "Edit Account",
            nav,
            accountData,
            errors: null
        });
    } catch (error) {
        next(error);
    }
}

/* ****************************************
 *  Update Account Info
 * *************************************** */
async function updateAccount(req, res, next) {
    try {
        const { account_id, account_firstname, account_lastname, account_email } = req.body;
        const nav = await utilities.getNav();

        // Check if the email is already in use
        const existingAccount = await accountModel.getAccountByEmail(account_email);
        if (existingAccount && existingAccount.account_id != account_id) {
            return res.render("account/update-account", {
                title: "Edit Account",
                nav,
                accountData: { account_id, account_firstname, account_lastname, account_email },
                errors: [{ msg: "Email address already in use." }]
            });
        }

        const result = await accountModel.updateAccount({ account_id, account_firstname, account_lastname, account_email });

        if (!result) {
            req.flash("notice", "Failed to update account information.");
        } else {
            req.flash("success", "Account information updated successfully.");
        }

        const accountData = await accountModel.getAccountById(account_id) || {};

        res.render("account/update-account", {
            title: "Edit Account",
            nav,
            accountData,
            errors: null
        });

    } catch (error) {
        next(error);
    }
}

/* ****************************************
 *  Change Account Password
 * *************************************** */
async function changePassword(req, res, next) {
    try {
        const { account_id, account_password } = req.body;
        const nav = await utilities.getNav();

        // Hash the new password
        const hashedPassword = await bcrypt.hash(account_password, 10);

        // Update password in database
        const result = await accountModel.updatePassword({ account_id, hashedPassword });

        if (!result) {
            req.flash("notice", "Failed to change password.");
        } else {
            req.flash("success", "Password changed successfully.");
        }

        const accountData = await accountModel.getAccountById(account_id) || {};

        res.render("account/update-account", {
            title: "Edit Account",
            nav,
            accountData,
            errors: null
        });

    } catch (error) {
        next(error);
    }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccount, accountLogout, buildUpdateForm, updateAccount, changePassword }