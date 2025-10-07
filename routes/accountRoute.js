// Needed Resources 
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation') 
const checkLogin = utilities.checkLogin 

// Route to build login view
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

// Route to build register view
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Default route for accounts 
router.get(
  "/", 
  checkLogin, 
  utilities.handleErrors(accountController.buildAccountManagement)
)

// Route to build account update view 
router.get(
  "/update", 
  checkLogin, 
  utilities.handleErrors(accountController.buildAccountUpdate)
)

// Route to process account update 
router.post(
  "/update", 
  checkLogin, 
  regValidate.accountUpdateRules(), 
  regValidate.checkUpdateData,      
  utilities.handleErrors(accountController.updateAccount)
)

// Password route
router.post(
  "/change-password", 
  checkLogin, 
  regValidate.passwordRules(),     
  regValidate.checkPasswordData,     
  utilities.handleErrors(accountController.changePassword)
)

// Logout route 
router.get(
  "/logout", 
  utilities.handleErrors(accountController.accountLogout)
)

module.exports = router
