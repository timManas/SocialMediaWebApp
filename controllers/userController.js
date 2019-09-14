const User = require("../models/User.js")

exports.login = function(req, res) {
    let user = new User(req.body)
    // user.login(function(result) {               // Solution: This is using a callback Solution. This is the traditional way of doing things
    //     res.send(result)
    // })                        
    
    // Remmeber its the Model and not the controller handling the business Logic
    user.login().then(function(result) {
        req.session.user = {favColour: "Blue", username: user.data.username}
        reqç.session.save(function() {
            res.redirect("/")
        })

    }).catch(function(e) {
        req.flash("errors", e)          // this actually does this req.session.flash.errors = [e]
        req.session.save(function() {
            res.redirect("/")
        })
    })         // then() executes if promise was successful and catch() executes if promise has failed
}

exports.logout = function(req, res) {
     // Deletes the session on MongoDB for THIS Particular user
    req.session.destroy(function() {
        res.redirect("/")           // Send them back to the home page ...AFTER we destroy the session. This is a callback
    })          

}

exports.register = function(req, res) {
    let user = new User(req.body)
    user.register()                     // This is the Model 
    if(user.errors.length) {
        res.send(user.errors)
    } else {
        res.send("Credentials Accepted")
    }
}

exports.home = function(req, res) {
    if(req.session.user) {
        res.render("home-dashboard", {username: req.session.user.username})
    } else {
        res.render("home-guest", {errors: req.flash("errors")})
    }
}

