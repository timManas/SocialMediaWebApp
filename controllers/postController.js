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

exports.viewSingle = async function(req, res) {
    try {
        let post = await Post.findSingleById(req.params.id, req.visitorId)
        res.render("single-post-screen", {post: post})          // the value "post" is the post from the DB
    } catch {
        res.render("404")
    }
}

exports.viewEditScreen = async function(req, res) {
    // We have a try catch because if the post doesent exists with that id, we render 404
    try {
        let post = await Post.findSingleById(req.params.id)         // Finds the post based off the id
        res.render("edit-post", {post: post})
    } catch {
        res.render("404")
    }
}

exports.edit = function(req, res) {
    let post = new Post(req.body, req.visitorId, req.params.id)
    post.update().then((status) => {
        
        if (status == "success") {
            // Post was succesfully updated in DB
            req.flash("success", "Successfully Updated")
            req.session.save(function(){
                res.redirect(`/post/${req.params.id}/edit`)
            })
        } else {
            console.log("Hit")
            // or user did have permission but had validation errors
            post.errors.forEach(function(error) {
                req.flash(error)
            }) 
            req.session.save(function() {
                res.redirect(`/post/${req.params.id}/edit`)
                
            })
            
        }
        
    }).catch(() => {
        // A post with the requested id doesent exists
        // or if the current visitor is not the owner of the requested post
        req.flash("errors", "Not enough permission to perform action")
        req.session.save(function() {
            res.redirect("/")
        })
    })
}