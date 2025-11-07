const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")


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

    try {
        const accountData = await accountModel.getAccountByEmail(account_email)
        if (!accountData) {
            req.flash("notice", "No account found with that email.")
            return res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email
            })
        }

        const passwordMatch = await accountModel.checkPassword(account_password, accountData.account_password)
        if (!passwordMatch) {
            req.flash("notice", "Invalid password. Please try again.")
            return res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email
            })
        }

        req.session.account = {
            account_id: accountData.account_id,
            account_firstname: accountData.account_firstname,
            account_email: accountData.account_email
        }
        req.flash("notice", `Welcome back, ${accountData.account_firstname}!`)
        res.redirect("/dashboard")

    } catch (error) {
        console.error(error)
        req.flash("notice", "An unexpected error occurred. Please try again.")
        res.status(500).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email
        })
    }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin }