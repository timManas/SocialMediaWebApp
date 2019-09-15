const Post = require("../models/Post.js")          // Import Post Model

exports.viewCreateScreen = function(req, res) {
    // res.render("create-post", {username: req.session.user.username, avatar: req.session.user.avatar})
    res.render("create-post")       // We can get rid of second argument because this is being called in app.js
}

exports.create = function(req, res) {
    let post = new Post(req.body, req.session.user._id)       // Create a new body
    post.create().then(function() {
        res.send("New post created")
    }).catch(function(errors) {
        res.send(errors)
    })
}

exports.viewSingle = function(req, res) {
    res.render("single-post-screen")

}