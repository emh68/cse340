const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
    let grid
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
                + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + 'details"><img src="' + vehicle.inv_thumbnail
                + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + ' on CSE Motors" ></a>'
            grid += '<div class="namePrice">'
            grid += '<hr >'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
                + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
                + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
                + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/**********************************
 * Build the details view HTML
 **********************************/
Util.buildDetailView = async function (vehicleData) {
    const formattedPrice = Number(vehicleData.inv_price).toLocaleString("en-US", {
        style: "currency", currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    })
    const formattedMiles = Number(vehicleData.inv_miles).toLocaleString()

    return `
  <section class="vehicle-detail-container">
    <div class="vehicle-image">
      <img src="${vehicleData.inv_image}" alt="Image of ${vehicleData.inv_make} ${vehicleData.inv_model}">
    </div>
    <div class="vehicle-info">
      <h1>${vehicleData.inv_year} ${vehicleData.inv_make} ${vehicleData.inv_model}</h1>
      <ul>
        <li><strong>Price:</strong> <span class="vehicle-price">${formattedPrice}</span></li>
        <li><strong>Mileage:</strong> ${formattedMiles} miles</li>
        <li><strong>Color:</strong> ${vehicleData.inv_color}</li>
        <li><strong>Classification:</strong> ${vehicleData.classification_name}</li>
        <li><strong>Description:</strong> ${vehicleData.inv_description}</li>
      </ul>
    </div>
  </section>
  `
}

/*****************************************************
 * Build classification select list for Add Inventory
 ***************************************************** */
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
        '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
        classificationList += '<option value="' + row.classification_id + '"'
        if (
            classification_id != null &&
            row.classification_id == classification_id
        ) {
            classificationList += " selected "
        }
        classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
}