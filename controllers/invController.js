const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const reviewModel = require("../models/review-model")

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
 *  Build inventory detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
    try {
        const inv_id = req.params.invId
        const vehicleArray = await invModel.getInventoryById(inv_id)
        const vehicleData = vehicleArray[0]

        // Fetch reviews for the vehicle
        const reviews = await reviewModel.getReviewsByInvId(inv_id)

        if (!vehicleData) {
            return next({ status: 404, message: "Vehicle not found" })
        }

        const detailHTML = await utilities.buildDetailView(vehicleData)
        const vehicleName = `${vehicleData.inv_make} ${vehicleData.inv_model}`
        const nav = await utilities.getNav()
        const accountData = res.locals.accountData || null

        res.render("./inventory/detail", {
            title: vehicleName,
            nav,
            detailHTML,
            reviews,
            errors: null,
            accountData,
            inv_id: vehicleData.inv_id
        })
    } catch (error) {
        next(error)
    }
}


/* ***************************
 * Build Inventory Management View
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()
        const classificationSelect = await utilities.buildClassificationList()

        res.render("./inventory/management", {
            title: "Vehicle Management",
            nav,
            classificationSelect
        })
    } catch (error) {
        next(error)
    }
}

/* *****************************
 * Show Add Classification form
 * ***************************** */
invCont.buildAddClassification = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            title: "Add Classification",
            nav,
            errors: null,
            classification_name: null
        })
    } catch (error) {
        next(error)
    }
}

/* ************************************
 * Add Classification form submission
 * ************************************ */
invCont.addClassification = async function (req, res, next) {
    try {

        const { classification_name } = req.body

        if (!classification_name) {
            req.flash('error', 'Please enter a classification name.')
            const nav = await utilities.getNav()
            return res.status(400).render("inventory/add-classification", {
                title: "Add Classification",
                nav,
                errors: null,
                classification_name
            })
        }

        const result = await invModel.addClassification(classification_name)
        if (result) {
            req.flash('success', `Classification "${classification_name}" added successfully!`)
            const nav = await utilities.getNav()
            return res.status(201).render("inventory/management", {
                title: "Inventory Management",
                nav
            })
        } else {
            req.flash('error', 'Failed to add classification.')
            const nav = await utilities.getNav()
            return res.status(500).render("inventory/add-classification", {
                title: "Add Classification",
                nav,
                errors: null,
                classification_name
            })
        }
    } catch (error) {
        next(error)
    }
}

/* ****************************************
*  Build Add Inventory View
* **************************************** */
invCont.buildAddInventoryView = async function (req, res, next) {
    try {
        const classificationSelect = await utilities.buildClassificationList()
        res.render("inventory/add-inventory", {
            title: "Add New Vehicle",
            nav: await utilities.getNav(),
            classificationList: classificationSelect,
            errors: null,
            inv_make: "",
            inv_model: "",
            inv_year: "",
            inv_description: "",
            inv_image: "/images/vehicles/no-image.png",
            inv_thumbnail: "/images/vehicles/no-image-tn.png",
            inv_price: "",
            inv_miles: "",
            inv_color: "",
        })
    } catch (error) {
        console.error("Error loading Add Inventory View:", error)
        next(error)
    }
}

/* ************************
*  Process Add Inventory
* ************************* */
invCont.addInventory = async function (req, res, next) {
    try {
        const {
            classification_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
        } = req.body

        const classificationIdNum = parseInt(classification_id)
        const invYearNum = parseInt(inv_year)
        const invPriceNum = parseFloat(inv_price)
        const invMilesNum = parseInt(inv_miles)

        const addResult = await invModel.addInventory(
            classificationIdNum,
            inv_make,
            inv_model,
            invYearNum,
            inv_description,
            inv_image,
            inv_thumbnail,
            invPriceNum,
            invMilesNum,
            inv_color
        )

        if (addResult) {
            req.flash("notice", "The new vehicle was successfully added.")
            res.redirect("/inv/")
        } else {
            req.flash("notice", "Sorry, the vehicle could not be added.")
            res.redirect("/inv/add-inventory")
        }
    } catch (error) {
        console.error("Error adding inventory:", error)
        next(error)
    }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    try {
        const classification_id = parseInt(req.params.classification_id)
        const invData = await invModel.getInventoryByClassificationId(classification_id)

        // Always return JSON, even if empty
        return res.json(invData) // empty array if no vehicles
    } catch (error) {
        next(error)
    }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
    const inv_id = parseInt(req.params.invId);
    let nav = await utilities.getNav();
    const itemData = (await invModel.getInventoryById(inv_id))[0];
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationList: classificationSelect,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_description: itemData.inv_description,
        inv_image: itemData.inv_image,
        inv_thumbnail: itemData.inv_thumbnail,
        inv_price: itemData.inv_price,
        inv_miles: itemData.inv_miles,
        inv_color: itemData.inv_color,
        classification_id: itemData.classification_id
    });
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    const {
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
    } = req.body

    const invIdNum = parseInt(inv_id);
    const classificationIdNum = parseInt(classification_id)
    const invYearNum = parseInt(inv_year)
    const invPriceNum = parseFloat(inv_price)
    const invMilesNum = parseInt(inv_miles)

    const updateResult = await invModel.updateInventory(
        invIdNum,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        invPriceNum,
        invYearNum,
        invMilesNum,
        inv_color,
        classificationIdNum
    )

    if (updateResult) {
        const itemName = updateResult.inv_make + " " + updateResult.inv_model
        req.flash("notice", `The ${itemName} was successfully updated.`)
        res.redirect("/inv/")
    } else {
        const classificationList = await utilities.buildClassificationList(classificationIdNum)
        const itemName = `${inv_make} ${inv_model}`
        req.flash("notice", "Sorry, the insert failed.")
        res.status(501).render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationList,
            errors: null,
            inv_id: invIdNum,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id: classificationIdNum,
        })
    }
}

/* *************************************************
 *  Build and deliver the delete confirmation view
 * ************************************************* */
invCont.buildDeleteView = async function (req, res, next) {
    try {
        const inv_id = parseInt(req.params.inv_id);
        const itemArray = await invModel.getInventoryById(inv_id);
        const itemData = itemArray[0];

        const nav = await utilities.getNav();
        const name = `${itemData.inv_make} ${itemData.inv_model}`;

        res.render('inventory/delete-confirm', {
            title: `Delete ${name}`,
            nav,
            errors: null,
            inv_id: itemData.inv_id,
            inv_make: itemData.inv_make,
            inv_model: itemData.inv_model,
            inv_year: itemData.inv_year,
            inv_price: itemData.inv_price
        });
    } catch (error) {
        next(error);
    }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
    try {
        const inv_id = parseInt(req.body.inv_id);
        const result = await invModel.deleteInventoryItem(inv_id);

        if (result.rowCount > 0) {
            req.flash('success', 'Inventory item deleted successfully.');
            res.redirect('/inv/');
        } else {
            req.flash('error', 'Delete failed. Try again.');
            res.redirect(`/inv/delete/${inv_id}`);
        }
    } catch (error) {
        next(error);
    }
}


module.exports = invCont