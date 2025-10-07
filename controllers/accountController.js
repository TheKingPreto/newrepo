const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* *************************
 * Deliver login view
 ************************* */
async function buildLogin(req, res, next) {
    try {
        let nav = await utilities.getNav()
        res.render("account/login", {
            title: "Login",
            nav,
            flashMessages: req.flash("notice"),
        })
    } catch (error) {
        next(error)
    }
}

/* *************************
 * Deliver registration view
 ************************* */
async function buildRegister(req, res, next) {
    try {
        let nav = await utilities.getNav()
        res.render("account/register", {
            title: "Register",
            nav,
            errors: null,
        })
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 * Process Registration
 **************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    try {
        const hashedPassword = await bcrypt.hash(account_password, 10)
        const regResult = await accountModel.registerAccount(
            account_firstname,
            account_lastname,
            account_email,
            hashedPassword
        )

        if (regResult) {
            req.flash(
                "notice",
                `Congratulations, ${account_firstname}! You are registered. Please log in.`
            )
            res.status(201).render("account/login", {
                title: "Login",
                nav,
            })
        } else {
            req.flash("notice", "Sorry, the registration failed.")
            res.status(501).render("account/register", {
                title: "Registration",
                nav,
            })
        }
    } catch (error) {
        req.flash("notice", "Sorry, there was an error processing the registration.")
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }
}

/* ****************************************
 * Process login attempt
 **************************************** */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            account_email,
            errors: null,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
            res.cookie("jwt", accessToken, {
                httpOnly: true,
                maxAge: 3600 * 1000, 
                secure: false,     
                sameSite: "lax"      
                })
            return res.redirect("/account/management")
        } else {
            req.flash("notice", "Please check your password and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                account_email,
                errors: null,
            })
            return
        }
    } catch (error) {
        console.error("Login error:", error)
        req.flash("notice", "An error occurred during login.")
        res.status(500).render("account/login", {
            title: "Login",
            nav,
            account_email,
            errors: null,
        })
    }
}

/* *************************
 * Build account management view (Task 3)
 ************************* */
async function buildAccountManagement(req, res, next) {
    let nav = await utilities.getNav()
    const { account_firstname, account_type, account_id } = res.locals.accountData

    res.render("account/management", {
        title: "Account Management",
        nav,
        errors: null,
        account_firstname,
        account_type,
        account_id
    })
}

/* *************************
 * Build account update view (Task 4)
 ************************* */
async function buildAccountUpdate(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_id } = res.locals.accountData

    res.render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
        account_id,
        formType: 'accountUpdate' 
    })
}

/* *************************
 * Process account update (Task 5)
 ************************* */
async function updateAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_id } = req.body

    const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)

    if (updateResult) {
        const updatedAccount = await accountModel.getAccountById(account_id)

        delete updatedAccount.account_password 
        const accessToken = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })

        req.flash("notice", "Account information updated successfully.")
        return res.redirect("/account")
    } else {
        req.flash("notice", "Something went wrong. Try again.")
        return res.render("account/update", {
            title: "Update Account",
            nav,
            errors: null,
            account_firstname,
            account_lastname,
            account_email,
            account_id,
            formType: 'accountUpdate'
        })
    }
}

/* *************************
 * Process password change (Task 5)
 ************************** */
async function changePassword(req, res) {
    const { account_id, account_password } = req.body

    try {
        const hashedPassword = await bcrypt.hash(account_password, 10)
        const result = await accountModel.updatePassword(account_id, hashedPassword)

        if (result) {
            req.flash("notice", "Password updated successfully.")
            return res.redirect("/account")
        } else {
            req.flash("notice", "Password update failed.")
            return res.redirect(`/account/update`)
        }
    } catch (error) {
        console.error("Password update error:", error)
        req.flash("notice", "Something went wrong. Try again.")
        return res.redirect(`/account/update`)
    }
}

/* *************************
 * Process logout (Task 6)
 ************************** */
async function accountLogout(req, res) {
    res.clearCookie("jwt")
    req.flash("notice", "You have been successfully logged out.")
    return res.redirect("/")
}

module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    accountLogin,
    buildAccountManagement,
    buildAccountUpdate,
    updateAccount,
    changePassword,
    accountLogout 
}
