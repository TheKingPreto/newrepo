const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")

const validate = {}

/* **********************************
 * Inventory Data Validation Rules (for add and update)
 * ********************************* */
validate.newInventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a make."),
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a model."),
    body("inv_year")
      .trim()
      .notEmpty()
      .isInt({ min: 1900, max: 2100 })
      .withMessage("Please provide a valid year."),
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a description."),
    body("inv_price")
      .trim()
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid price."),
    body("inv_miles")
      .trim()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Please provide valid mileage."),
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a color."),
    body("classification_id")
      .trim()
      .notEmpty()
      .isInt()
      .withMessage("Please select a classification.")
  ]
}

/* **********************************
 * Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isAlpha()
      .withMessage("A first name is required."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isAlpha()
      .withMessage("A last name is required."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email address is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please log in or use a different email address.")
        }
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .isLength({ min: 12 })
      .withMessage("Please enter a password that is at least 12 characters.")
      .matches("^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\\da-zA-Z])(.{12,})$")
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* **********************************
 * Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email is required."),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ]
}

/* ******************************
 * Check login data and return errors or continue
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}

/* **********************************
 * Account Update Data Validation Rules (Task 5)
 * ********************************* */
validate.accountUpdateRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isAlpha()
      .withMessage("Please provide a first name.")
      .isLength({ min: 1 }), 

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isAlpha()
      .withMessage("Please provide a last name.")
      .isLength({ min: 1 }), 

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email address is required.")
      .custom(async (account_email, { req }) => {
        const { account_id } = req.body
        const account = await accountModel.getAccountById(account_id)
        if (account_email !== account.account_email) {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (emailExists) {
            throw new Error("Email already exists. Please use a different email address.")
          }
        }
      }),
  ]
}

/* ******************************
 * Check data and return errors or continue to account update (Task 5)
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update", {
      errors,
      title: "Update Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
      formType: 'accountUpdate' 
    })
    return
  }
  next()
}

/* **********************************
 * Password Update Validation Rules (Task 5)
 * ********************************* */
validate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isLength({ min: 12 })
      .withMessage("Please enter a new password that is at least 12 characters.")
      .matches("^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\\da-zA-Z])(.{12,})$")
      .withMessage("Password must contain at least 1 uppercase, 1 lowercase, 1 number and 1 special character."),
  ]
}

/* ******************************
 * Check password data and return errors or continue to password change (Task 5)
 * ***************************** */
validate.checkPasswordData = async (req, res, next) => {
  const { account_id } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const account = await accountModel.getAccountById(account_id)
    res.render("account/update", {
      errors,
      title: "Update Account",
      nav,
      account_firstname: account.account_firstname,
      account_lastname: account.account_lastname,
      account_email: account.account_email,
      account_id,
      formType: 'passwordChange' 
    })
    return
  }
  next()
}

module.exports = validate
