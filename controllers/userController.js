const User = require("../Models/User.js")

exports.login = function(req, res) {
    let user = new User(req.body)
    user.login(function(result) {               // Solution: This is using a callback Solution. This is the traditional way of doing things
        res.send(result)
    })                        // Remmeber its the Model and not the controller handling the business Logic
    
}

exports.logout = function(req, res) {

}

exports.register = function(req, res) {
    let user = new User(req.body)
    user.register()                     // This is the Model 
    if(user.errors.length > 0) {
        res.send(user.errors)
    } else {
        res.send("Credentials Accepted")
    }
}

exports.home = function(req, res) {
    res.render("home-guest")
}

