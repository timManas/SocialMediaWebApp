const express = require ("express")     // We make this const because we dont want this to change ever. 
const app = express()

// We need to tell express where to find our "views"
app.use(express.static("public")) // Make the 
app.set("views", "views")       // The second argument is the name of the file(In this case it is views)
app.set("view engine", "ejs")   // We need to define the view engine


// Scenario: Guess view Home Page Landing 
app.get("/", function(req, res) {
    res.render("home-guest")        // We use Render because our Engine 
})

app.listen(3000)
