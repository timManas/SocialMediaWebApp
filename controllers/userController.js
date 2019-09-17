const User = require("../models/User.js")
const Post = require("../models/Post.js")

exports.mustBeLoggedIn = function(req, res, next) {

    // If user is logged in
    if(req.session.user) {
        next()                      // Tell Express to call the  next function in this route
    } else {
        req.flash("errors", "Must be logged in to POST")
        req.session.save(function() {
            res.redirect("/")
            console.log("Redirecting to HomePage")
        })
    }
}

exports.login = function(req, res) {
    let user = new User(req.body)
    // user.login(function(result) {               // Solution: This is using a callback Solution. This is the traditional way of doing things
    //     res.send(result)
    // })                        
    
    // Remmeber its the Model and not the controller handling the business Logic
    user.login().then(function(result) {
        req.session.user = {avatar: user.avatar, username: user.data.username, _id:user.data._id}
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
    user.register().then(()=> {

        req.session.user = {avatar: user.avatar, username: user.data.username, _id:user.data._id}
        req.session.save(function() {
            res.redirect("/")
        })
        
    }).catch((regErrors)=> {
        regErrors.forEach(function(err) {
            req.flash("regErrors", err)
        }) 
        req.session.save(function() {
            res.redirect("/")
        })
    })                  // This is the Model 

}

exports.home = function(req, res) {
    if(req.session.user) {
        res.render("home-dashboard")
    } else {
        res.render("home-guest", {errors: req.flash("errors"), regErrors: req.flash("regErrors")})
    }
}

exports.ifUserExists = function(req, res, next) {
    User.findByUsername(req.params.username).then(function(userDocument) {
        req.profileUser = userDocument          // We create a new prooperty "profileUser" under the request
        next()
    }).catch(function(error) {
        res.render("404")
    })
}

exports.profilePostsScreen = function(req, res) {

    // Ask post model for posts by authorid
    Post.findByAuthorId(req.profileUser._id).then(function(posts) {
        res.render("profile", {
            posts: posts,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar
        })
    }).catch(function() {
        res.render("404")
    })

    
}
