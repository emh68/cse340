const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function (req, res) {
    const nav = await utilities.getNav()
    res.render("index", { title: "Home", nav })
}

// Test function to trigger a 500 error
baseController.triggerError = async function (req, res, next) {
    throw new Error("Intentional 500 error for testing.")
}


module.exports = baseController