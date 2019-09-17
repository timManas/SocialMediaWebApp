const express = require("express")     // We make this const because we dont want this to change ever. 
const app = express()
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)    
const flash = require("connect-flash")    
const router = require("./router.js")



// We need to configur the session to trust users who have successfully Logged in
let sessionOptions = session({
    secret: "Hello World",
    store: new MongoStore({client: require("./db")}),                   // this creates a collection on Mongo DB
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60 * 24,
             httpOnly: true}
})

app.use(sessionOptions)     // Our app Now supports Sessions
app.use(flash())            // Use flash animations

// Tells Express to run this function for EVERY request
// Because we are calling this before our router, next() will call whatever relevant functions in our route
app.use(function(req, res, next) {
    
    // make all error and success flash messages available from all tempaltes
    res.locals.errors = req.flash("errors")
    res.locals.success = req.flash("success")   
    
    // make current userId  available on req object
    // Now no matter what controller function we are in, there will be a visitorId on the request 
    if(req.session.user) {
        req.visitorId = req.session.user._id
    } else {
        req.visitorId = 0
    }
    
    // make user session data available  from within view templates
    res.locals.user = req.session.user  //We are now working with an object available from our EJS templates
    next()                      
})


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
