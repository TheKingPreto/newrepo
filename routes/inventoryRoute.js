// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build inventory detail view by inv_id
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInvId))

// Inventory Management view
router.get("/", invController.buildManagement);

// Intentional 500 error route
router.get("/trigger-error", (req, res, next) => {
  return next(new Error("Intentional Server Error for testing"))
})

// Deliver form to add classification
router.get("/add-classification", invController.buildAddClassification)

// Handle classification form submit 
router.post("/add-classification", invController.addClassification)

// Deliver form to add inventory
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
);

// Handle inventory form submit
router.post(
  "/add-inventory",
  utilities.handleErrors(invController.addInventory)
);

module.exports = router;