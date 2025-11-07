const utilities = require("../utilities/")
const accountModel = require("../models/account-model")


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

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
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