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
      return next({ status: 404, message: "No vehicles found for this classification" })
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
invCont.buildByInvId = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    const vehicleData = await invModel.getVehicleById(inv_id)

    if (!vehicleData) {
      return next({ status: 404, message: "Vehicle not found" })
    }

    const grid = await utilities.buildVehicleDetailHTML(vehicleData)
    const nav = await utilities.getNav()

    res.render("./inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      grid,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash(),
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Deliver add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      messages: req.flash(),
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Handle add classification POST
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body

    if (!classification_name || classification_name.trim() === "") {
      req.flash("error", "Classification name is required")
      return res.redirect("/inv/add-classification")
    }

    const result = await invModel.addClassification(classification_name)

    if (result.rowCount > 0) {
      req.flash("success", "Classification added successfully!")
      res.redirect("/inv")
    } else {
      req.flash("error", "Failed to add classification. Try again.")
      res.redirect("/inv/add-classification")
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Deliver add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  console.log("Accessing add-inventory route")
  try {
    const classificationData = await invModel.getClassifications()
    const classificationSelect = await utilities.buildClassificationList(classificationData.rows)
    const nav = await utilities.getNav()

    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationSelect,
      flashMessage: null,
      errors: null,
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_image: "",
      inv_thumbnail: "",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
    })
  } catch (error) {
    console.error("Error in buildAddInventory:", error)
    next(error)
  }
}

/* ***************************
 *  Handle add inventory POST
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    const { inv_make, inv_model, inv_year, classification_id } = req.body

    // Simple validation
    const errors = []
    if (!inv_make || inv_make.trim() === "") errors.push({ msg: "Make is required" })
    if (!inv_model || inv_model.trim() === "") errors.push({ msg: "Model is required" })
    if (!inv_year || isNaN(inv_year)) errors.push({ msg: "Valid year is required" })
    if (!classification_id) errors.push({ msg: "Classification is required" })

    if (errors.length > 0) {
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      const nav = await utilities.getNav()
      return res.render('inventory/add-inventory', {
        title: "Add New Vehicle",
        nav,
        classificationSelect,
        flashMessage: null,
        errors,
        inv_make,
        inv_model,
        inv_year,
        classification_id
      })
    }

    const result = await invModel.addInventory({ inv_make, inv_model, inv_year, classification_id })

    if (result.rowCount > 0) {
      req.flash('success', 'Vehicle added successfully!')
      return res.redirect('/inv')
    } else {
      throw 'Failed to add vehicle'
    }

  } catch (error) {
    try {
      const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)
      const nav = await utilities.getNav()

      res.render('inventory/add-inventory', {
        title: "Add New Vehicle",
        nav,
        classificationSelect,
        flashMessage: null,
        errors: [{ msg: 'Failed to add vehicle. Please check your inputs.' }],
        ...req.body
      })
    } catch (innerError) {
      next(innerError)
    }
  }
}

module.exports = invCont
