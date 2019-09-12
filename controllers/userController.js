const User = require("../Models/User.js")

exports.login = function(req, res) {

}

exports.logout = function(req, res) {

}

exports.register = function(req, res) {
    let user = new User(req.body)
    user.register()                     // This is the Model 
    user.validate()
        
    if(user.errors.length > 0) {
        res.send(user.errors)
    } else {
        res.send("Credentials Accepted")
    }
}

exports.home = function(req, res) {
    res.render("home-guest")
}

