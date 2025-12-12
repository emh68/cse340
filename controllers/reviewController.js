const reviewModel = require("../models/review-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");
const invModel = require("../models/inventory-model");


/* ***************************
 *  Display reviews for a specific vehicle
 * ************************** */
async function buildReviewsByInvId(req, res, next) {
    try {
        const inv_id = parseInt(req.params.inv_id);
        const reviews = await reviewModel.getReviewsByInvId(inv_id);

        const nav = await utilities.getNav();

        res.render("review/vehicle-reviews", {
            title: "Vehicle Reviews",
            nav,
            reviews,
            inv_id,
            errors: null
        });
    } catch (error) {
        next(error);
    }
}

/* ***************************
 *  Adding a review
 * ************************** */
async function addReview(req, res, next) {
    try {
        const { inv_id, review_text } = req.body;
        const accountData = res.locals.accountData;

        if (!accountData) {
            req.flash("notice", "Please log in to submit a review.");
            return res.redirect(`/inv/detail/${inv_id}`);
        }

        const account_id = accountData.account_id;
        const screenName = `${accountData.account_firstname.charAt(0)}${accountData.account_lastname}`;
        const result = await reviewModel.addReview(review_text, inv_id, account_id, screenName);

        if (result) {
            req.flash("success", "Your review was successfully submitted.");
        } else {
            req.flash("notice", "Sorry, the review could not be added.");
        }

        return res.redirect(`/inv/detail/${inv_id}`);
    } catch (error) {
        next(error);
    }
}

/* ***************************
 *  Build the edit review view
 * ************************** */
async function buildEditReview(req, res, next) {
    try {
        const review_id = parseInt(req.params.review_id);
        const reviewData = await reviewModel.getReviewById(review_id);

        if (!reviewData) {
            req.flash("notice", "Review not found.");
            return res.redirect("/account/");
        }

        const accountData = res.locals.accountData;
        if (!accountData || accountData.account_id !== reviewData.account_id) {
            req.flash("notice", "You can only edit your own reviews.");
            return res.redirect("/account/");
        }

        const vehicleArray = await invModel.getInventoryById(reviewData.inv_id);
        const vehicle = vehicleArray[0];

        const nav = await utilities.getNav();

        res.render("review/edit-review", {
            title: `Edit ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model} Review`,
            nav,
            review: reviewData,
            errors: null
        });
    } catch (error) {
        next(error);
    }
}

/* ***************************
 *  Process updating a review
 * ************************** */
async function updateReview(req, res, next) {
    const errors = validationResult(req);
    try {
        const { review_id, review_text, inv_id } = req.body;
        const accountData = res.locals.accountData;

        const existing = await reviewModel.getReviewById(parseInt(review_id));
        if (!existing) {
            req.flash("notice", "Review not found.");
            return res.redirect("/account/");
        }
        if (!accountData || accountData.account_id !== existing.account_id) {
            req.flash("notice", "You can only update your own reviews.");
            return res.redirect("/account/");
        }

        if (!errors.isEmpty()) {
            const nav = await utilities.getNav();
            req.flash("notice", "Update failed. Please correct the errors.");
            return res.status(400).render("review/edit-review", {
                title: "Edit Review",
                nav,
                review_id: review_id,
                review_text: review_text,
                // errors: errors.array(),
                errors: null
            });
        }

        const result = await reviewModel.updateReview(parseInt(review_id), review_text);

        if (result) {
            req.flash("success", "Your review was successfully updated.");
        } else {
            req.flash("notice", "Sorry, the review update failed.");
        }

        return res.redirect("/account/");
    } catch (error) {
        next(error);
    }
}

/* ***************************
 * Build Delete Review View
 * ************************** */
async function buildDeleteReview(req, res, next) {
    try {
        const review_id = parseInt(req.params.review_id);
        const reviewData = await reviewModel.getReviewById(review_id);

        if (!reviewData) {
            req.flash("notice", "Review not found.");
            return res.redirect("/account/");
        }

        const vehicleArray = await invModel.getInventoryById(reviewData.inv_id);
        const vehicle = vehicleArray[0];

        const nav = await utilities.getNav();

        res.render("./review/delete-review", {
            title: `Delete ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model} Review`,
            nav,
            review: reviewData,
            vehicle,
            errors: null
        });

    } catch (error) {
        next(error);
    }
}

/* ***************************
 * Delete a review
 * ************************** */
async function deleteReview(req, res, next) {
    try {
        const { review_id } = req.body;
        const accountData = res.locals.accountData;

        const existing = await reviewModel.getReviewById(parseInt(review_id));
        if (!existing) {
            req.flash("notice", "Review not found.");
            return res.redirect("/account/");
        }
        if (!accountData || accountData.account_id !== existing.account_id) {
            req.flash("notice", "You can only delete your own reviews.");
            return res.redirect("/account/");
        }

        const result = await reviewModel.deleteReview(parseInt(review_id));

        if (result) {
            req.flash("success", "The review was deleted.");
        } else {
            req.flash("notice", "Sorry, the review could not be deleted.");
        }

        return res.redirect("/account/");
    } catch (error) {
        next(error);
    }
}

module.exports = { buildReviewsByInvId, addReview, buildEditReview, updateReview, buildDeleteReview, deleteReview };
