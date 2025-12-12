// Needed Resources 
const express = require("express");
const router = new express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities/");
const reviewValidate = require("../utilities/review-validation");

// Process new review
router.post("/add", utilities.checkLogin, reviewValidate.addReviewRules(), reviewValidate.checkReviewData, utilities.handleErrors(reviewController.addReview));

// Build edit review view
router.get("/edit/:review_id", utilities.checkLogin, utilities.handleErrors(reviewController.buildEditReview));

// Process update
router.post("/update", utilities.checkLogin, reviewValidate.updateReviewRules(), reviewValidate.handleEditDeleteErrors, utilities.handleErrors(reviewController.updateReview));

// Build delete confirmation view
router.get("/delete/:review_id", utilities.checkLogin, utilities.handleErrors(reviewController.buildDeleteReview));

// Process delete
router.post("/delete", utilities.checkLogin, reviewValidate.updateReviewRules(), reviewValidate.handleEditDeleteErrors, utilities.handleErrors(reviewController.deleteReview));

module.exports = router;
