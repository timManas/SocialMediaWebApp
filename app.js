const express = require("express")     // We make this const because we dont want this to change ever. 
const app = express()
const router = require("./router.js")

// Note this is how you submit data over the web via json
// Tell express to add user submitted data onto our request object. So we can access it from req.body
app.use(express.urlencoded({extended: false}))      // Boilder plate code 
app.use(express.json())

// We need to tell express where to find our "views"
app.use(express.static("./public/")) // location of the static assets

// We nee to set the views location & Engine Type
app.set("views", "./views/")       // The second argument is the name of the file(In this case it is views)
app.set("view engine", "ejs")   // We need to define the view engine

// Route our requests
app.use("/", router)        // Routes our request


module.exports = app
