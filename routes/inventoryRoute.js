// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const { newInventoryRules, checkUpdateData } = require("../utilities/account-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build inventory detail view by inv_id
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInvId))

// Inventory Management view
router.get("/", invController.buildManagement)

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
)

// Handle inventory form submit
router.post(
  "/add-inventory",
  utilities.handleErrors(invController.addInventory)
)

//Inventory.js route
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

//Route to deliver the edit inventory view
router.get(
  "/EditInventory/:inventory_id",
  utilities.handleErrors(invController.buildEditInventoryView)
)

//Route to handle the update inventory
router.post(
  "/update",
  utilities.handleErrors(invController.updateInventory)
)

//Route to inventory validation
router.post(
  "/update",
  newInventoryRules(),      
  checkUpdateData,         
  utilities.handleErrors(invController.updateInventory)
)

// Deliver delete confirmation view
router.get("/delete/:inv_id", utilities.handleErrors(invController.buildDeleteInventory))

// Handle delete process
router.post("/delete", utilities.handleErrors(invController.deleteInventory))

module.exports = router;