const { body, validationResult } = require("express-validator");
const utilities = require("../utilities");
const invModel = require("../models/inventory-model");
const reviewModel = require("../models/review-model");

const validate = {}

/* ******************************
 * Add Review Validation Rules
 * ******************************* */
validate.addReviewRules = () => {
    return [
        body("review_text")
            .trim()
            .isLength({ min: 3 })
            .withMessage("Review text cannot be empty."),
    ];
}

/* ******************************
 * Update Review Validation Rules
 * ******************************* */
validate.updateReviewRules = () => {
    return [
        body("review_text")
            .trim()
            .notEmpty()
            .withMessage("Review text cannot be empty."),
    ];
}

/* ***********************************************
 * Check Review Data load vehicle detail page
 * **********************************************/
validate.checkReviewData = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const inv_id = req.body.inv_id;
        const vehicleArray = await invModel.getInventoryById(inv_id);
        const vehicleData = vehicleArray[0];
        const detailHTML = await utilities.buildDetailView(vehicleData);
        const reviews = await reviewModel.getReviewsByInvId(inv_id);
        const nav = await utilities.getNav();
        const accountData = res.locals.accountData || null;

        return res.status(400).render("inventory/detail", {
            title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
            nav,
            detailHTML,
            reviews,
            inv_id: inv_id,
            accountData,
            errors: errors.array(),
            reviewText: req.body.review_text
        });
    }
    next();
}

validate.handleEditDeleteErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const review = {
            review_id: req.body.review_id,
            inv_id: req.body.inv_id,
            account_id: req.body.account_id,
            review_screen_name: req.body.review_screen_name,
            review_text: req.body.review_text
        };
        const accountData = res.locals.accountData;
        const view = req.originalUrl.includes("/update") ? "edit-review" : "delete-review";
        return res.status(400).render(view, {
            title: view === "edit-review" ? "Edit Review" : "Delete Review",
            review,
            accountData,
            errors: errors.array()
        });
    }
    next();
};


module.exports = validate;