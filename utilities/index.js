require("dotenv").config()
const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")

const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data
  try {
    const result = await invModel.getClassifications()
    data = result.rows
  } catch (error) {
    console.error("Error fetching classifications:", error)
    data = []
  }

  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.forEach((row) => {
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

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="/inv/detail/'+ vehicle.inv_id 
      grid +=  '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model 
      grid +=  ' details"><img src="' + vehicle.inv_thumbnail 
      grid +=  '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model 
      grid +=  ' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<h2>'
      grid += '<a href="/inv/detail/' + vehicle.inv_id +'" title="View ' 
      grid += vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      grid += vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid  = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ****************************************
 * Build the classification select list 
 **************************************** */
Util.buildClassificationList = async function (selectedId) {
  let data
  try {
    const result = await invModel.getClassifications()
    data = result.rows
  } catch (error) {
    console.error("Error fetching classifications:", error)
    data = []
  }

  let list = '<select name="classification_id" id="classificationList">'
  list += '<option value="">Choose a Classification</option>'
  data.forEach(row => {
    const selected = row.classification_id == selectedId ? ' selected' : ''
    list += `<option value="${row.classification_id}"${selected}>${row.classification_name}</option>`
  })
  list += '</select>'
  return list
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity (Updated to use res.locals)
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     res.clearCookie("jwt")
     res.locals.loggedIn = 0 
     res.locals.accountData = null
     return next() 
    }
    res.locals.accountData = accountData
    res.locals.loggedIn = 1
    next()
   })
 } else {
  res.locals.loggedIn = 0 
  res.locals.accountData = null
  next()
 }
}

/* ****************************************
 * Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedIn) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 * Check Authorization (Task 2)
 * ************************************ */
Util.checkAuthorization = (req, res, next) => {
  const accountType = res.locals.accountData?.account_type
  
  if (accountType === "Employee" || accountType === "Admin") {
    next()
  } else {
    req.flash("notice", "You do not have the required authorization (Employee or Admin) to access this area. Please log in with an authorized account.")
    return res.redirect("/account/login")
  }
}

module.exports = Util
