const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    try {
        const classification_id = req.params.classificationId
        const data = await invModel.getInventoryByClassificationId(classification_id)

        if (!data || data.length === 0) {
            return next({ status: 404, message: "Classification not found" })
        }

        const grid = await utilities.buildClassificationGrid(data)
        const nav = await utilities.getNav()
        const className = data[0].classification_name

        res.render("./inventory/classification", {
            title: className + " vehicles",
            nav,
            grid,
        })
    } catch (error) {
        next(error)
    }
}


/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
    try {
        const inv_id = req.params.invId
        const vehicleArray = await invModel.getInventoryById(inv_id)
        const vehicleData = vehicleArray[0]

        if (!vehicleData) {
            return next({ status: 404, message: "Vehicle not found" })
        }

        const detailHTML = await utilities.buildDetailView(vehicleData)
        const vehicleName = `${vehicleData.inv_make} ${vehicleData.inv_model}`
        const nav = await utilities.getNav()

        res.render("./inventory/detail", {
            title: vehicleName,
            nav,
            detailHTML
        })
    } catch (error) {
        next(error)
    }
}

module.exports = invCont