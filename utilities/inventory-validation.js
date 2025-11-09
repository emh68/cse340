const { body, validationResult } = require('express-validator');


/*  *********************
*  Classification Rules
* *********************** */
function classificationRules() {
    return [
        body('classification_name')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Classification name is required.')
            .matches(/^[A-Za-z]+$/)
            .withMessage('Classification name may only contain letters and numbers (no spaces or special characters).')
    ];
}

/* **************************
 * Check Classification Data
 * ************************* */
function checkClassificationData(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = '';
        if (req.app.locals.nav) nav = req.app.locals.nav;
        return res.status(400).render('inventory/add-classification', {
            title: 'Add Classification',
            nav,
            errors,
        });
    }
    next();
}

/*  *****************
*  Inventory Rules
* ******************* */
function inventoryRules() {
    return [
        body('classification_id')
            .isInt({ min: 1 })
            .withMessage('Please select a valid classification.'),

        body('inv_make')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Make is required.')
            .matches(/^[A-Za-z ]+$/)
            .withMessage('Make may only contain letters, numbers, and spaces.'),

        body('inv_model')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Model is required.')
            .matches(/^[A-Za-z0-9 ]+$/)
            .withMessage('Model may only contain letters, numbers, and spaces.'),

        body('inv_year')
            .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
            .withMessage('Enter a valid year.'),

        body('inv_description')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Description is required.'),

        body('inv_image')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Image path is required.'),

        body('inv_thumbnail')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Thumbnail path is required.'),

        body('inv_price')
            .isFloat({ min: 0 })
            .withMessage('Price must be a positive number.'),

        body('inv_miles')
            .isInt({ min: 0 })
            .withMessage('Miles must be a non-negative integer.'),

        body('inv_color')
            .trim()
            .isLength({ min: 1 })
            .withMessage('Color is required.')
            .matches(/^[A-Za-z ]+$/)
            .withMessage('Color may only contain letters and spaces.')
    ];
}

/* **************************
 * Check Inventory Data
 * ************************* */
async function checkInventoryData(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = '';
        if (req.app.locals.nav) nav = req.app.locals.nav;

        // Get the dropdown classification list again
        const utilities = require(".");
        const classificationSelect = await utilities.buildClassificationList(req.body.classification_id);

        return res.status(400).render('inventory/add-inventory', {
            title: 'Add New Inventory',
            nav,
            classificationList: classificationSelect,
            errors,
            ...req.body
        });
    }
    next();
}

module.exports = { classificationRules, checkClassificationData, inventoryRules, checkInventoryData };
