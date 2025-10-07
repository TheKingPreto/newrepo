/* ******************************************
 * Primary file of the application
 *******************************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const session = require("express-session")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const flash = require("connect-flash")
const messages = require("express-messages")
const pool = require("./database/")
const utilities = require("./utilities")
require("dotenv").config()

const app = express()

// Routes and controllers
const staticRoutes = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Middleware
 *************************/

// Session middleware (for flash and user session)
app.use(
 session({
  store: new (require("connect-pg-simple")(session))({
   createTableIfMissing: true,
   pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "sessionId",
 })
)

// Body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Cookie parser
app.use(cookieParser())

app.use(utilities.checkJWTToken)

// Flash messages
app.use(flash())
app.use((req, res, next) => {
 res.locals.messages = messages(req, res)
 next()
})

// Make flashMessages available in all views
app.use((req, res, next) => {
 res.locals.flashMessages = req.flash("notice")
 next()
})

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes)
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)

// 404 Handler
app.use(async (req, res, next) => {
 next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

/* ***********************
 * Global Error Handler
 *************************/
app.use(async (err, req, res, next) => {
 let nav = await utilities.getNav()
 console.error(`Error at: "${req.originalUrl}": ${err.message}`)
 const message =
  err.status == 404
   ? err.message
   : "Oh no! There was a crash. Maybe try a different route?"
 res.status(err.status || 500).render("errors/error", {
  title: err.status || "Server Error",
  message,
  nav,
 })
})

/* ***********************
 * Server Startup
 *************************/
const port = process.env.PORT
const host = process.env.HOST
app.listen(port, host, () => {
 console.log(`✅ App listening on http://${host}:${port}`)
})
