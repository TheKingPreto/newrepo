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
    const classificationSelect = await utilities.buildClassificationList()
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      flashMessage: flashMessage.length > 0 ? flashMessage[0] : null
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
    const classificationSelect = await utilities.buildClassificationList(
      classificationData.rows || classificationData
    )
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
      classification_id: ""
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
    const {
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id
    } = req.body

    const classificationData = await invModel.getClassifications()
    const classificationSelect = await utilities.buildClassificationList(
      classificationData.rows || classificationData,
      classification_id
    )

    if (!inv_make || !inv_model || !inv_year || !classification_id) {
      let nav = await utilities.getNav()
      return res.render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationSelect,
        errors: [{ msg: "Please fill in all required fields." }],
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        flashMessage: req.flash("notice") || null
      })
    }

    const addResult = await invModel.addInventory({
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id
    })

    if (addResult) {
      req.flash("notice", `The ${inv_make} ${inv_model} was successfully added.`)
      res.redirect("/inv/")
    } else {
      let nav = await utilities.getNav()
      res.render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationSelect,
        errors: [{ msg: "Sorry, the insert failed." }],
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
        flashMessage: req.flash("notice") || null
      })
    }

  } catch (error) {
    console.error("Error in addInventory:", error)
    next(error)
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Edit inventory view
 * ************************** */
invCont.editInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
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
  })
}

/* ***************************
 *  Update inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    const {
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id
    } = req.body

    const classificationData = await invModel.getClassifications()
    const classificationSelect = await utilities.buildClassificationList(
      classificationData.rows || classificationData,
      classification_id
    )

    if (!inv_make || !inv_model || !inv_year || !classification_id) {
      let nav = await utilities.getNav()
      return res.render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationSelect,
        errors: [{ msg: "Please fill in all required fields." }],
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        flashMessage: req.flash("notice") || null
      })
    }

    const updateResult = await invModel.updateInventory({
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id
    })

    if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")  
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }

  } catch (error) {
    console.error("Error in addInventory:", error)
    next(error)
  }
}

module.exports = invCont
