const { body, validationResult } = require("express-validator")
const utilities = require(".") 
const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")

const reviewValidate = {}

/* ****************************************
 * Review Submission Rules
 * *************************************** */
reviewValidate.reviewRules = () => {
  return [
    body("review_text")
      .trim()
      .isLength({ min: 5 })
      .withMessage("The comment must be at least 5 characters long.")
      .escape(), 
    
    body("inv_id")
        .trim()
        .isInt({ min: 1 })
        .withMessage("Invalid vehicle ID."),
  ]
}

/* ****************************************
 * Check Review Data
 * *************************************** */
reviewValidate.checkReviewData = async (req, res, next) => {
    const { review_text, inv_id } = req.body
    let errors = validationResult(req)
    
    if (!errors.isEmpty()) {
        
        let nav = await utilities.getNav()
        const vehicleData = await invModel.getVehicleById(inv_id) 
        const detailHTML = await utilities.buildVehicleDetail(vehicleData)
        
        const reviews = await reviewModel.getReviewsByInventoryId(inv_id)
        
        res.render("./inventory/detail", {
            title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
            nav,
            detailHTML,
            vehicle: vehicleData, 
            reviews: reviews,
            errors,
            review_text: review_text 
        })
        return
    }
    next()
}

module.exports = reviewValidate