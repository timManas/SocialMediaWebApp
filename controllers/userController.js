const User = require("../models/User.js")
const Post = require("../models/Post.js")
const Follow = require("../models/Follow.js")
const jwt = require("jsonwebtoken")

exports.doesUsernameExists = function(req, res) {
    User.findByUsername(req.body.username).then(function() {
        res.json(true)
    }).catch(function() {
        res.json(false)
    })     // This is the Axios post from the FE JS 
}

exports.doesEmailExists = async function(req, res) {
    let emailBool = await User.doesEmailExists(req.body.email)
    res.json(emailBool)
}

exports.sharedProfileData = async function(req, res, next) {
    let isVisitorsProfile = false        //  Need this to check if we are trying to follow ourself
    let isFollowing = false             // Need this to track if we are following another user or not
    

    // Check if user already follows other person
    if (req.session.user) {
        isVisitorsProfile = req.profileUser._id.equals(req.session.user._id)
        isFollowing = await Follow.isVisitorFollowing(req.profileUser._id, req.visitorId) 
    } 

    req.isVisitorsProfile = isVisitorsProfile
    req.isFollowing = isFollowing

    // retrieve post, follower and following counts

    // This code below SUCKS ..do not use it. We should not use await like this for peroformance reason
    // let postCount = await Post.countsPostByAuthor()
    // let followerCount = await Follow.countsFollowersById()
    // let followingCount = await Follow.countFollowingById()

    let postCountPromise = Post.countsPostByAuthor(req.profileUser._id)
    let followerCountPromise = Follow.countFollowersById(req.profileUser._id)
    let followingCountPromise = Follow.countFollowingById(req.profileUser._id)
    let [postCount, followerCount, followingCount] = await Promise.all([postCountPromise, followerCountPromise, followingCountPromise])

    req.postCount = postCount
    req.followerCount = followerCount
    req.followingCount = followingCount

    next()
}

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
        req.session.save(function() {
            res.redirect("/")
        })

    }).catch(function(e) {
        console.log("Error Triggered")
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

exports.home =  async function(req, res) {
    if(req.session.user) {

        // Fetch feed of post for current user
        let posts = await Post.getFeed(req.session.user._id)        // Create a list of post for the home page to render

        res.render("home-dashboard", {posts: posts})
    } else {
        res.render("home-guest", {regErrors: req.flash("regErrors")})
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
            title: `Profile for ${req.profileUser.username}`,
            currentPage: "posts",
            posts: posts,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing, 
            isVisitorsProfile: req.isVisitorsProfile,
            counts: {
                postCount: req.postCount,
                followerCount: req.followerCount,
                followingCount: req.followingCount
            }
        })
    }).catch(function() {
        res.render("404")
    })

}

exports.profileFollowersScreen = async function(req, res) {
    
    try {
        
        let followers = await Follow.getFollowersById(req.profileUser._id)
        
        // We render the page and add the following properties so it exists when we do <%= %> ejs
        res.render('profile-followers', {
            currentPage: "followers",
            followers: followers,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing, 
            isVisitorsProfile: req.isVisitorsProfile,
            counts: {
                postCount: req.postCount,
                followerCount: req.followerCount,
                followingCount: req.followingCount
            }
        })
    } catch(e) {
        console.log("Error")
        res.render("404")
    }
}



exports.profileFollowingScreen = async function(req, res) {
    
    try {
        
        let following = await Follow.getFollowingById(req.profileUser._id)
        
        // We render the page and add the following properties so it exists when we do <%= %> ejs
        res.render('profile-following', {
            currentPage: "following",
            following: following,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing, 
            isVisitorsProfile: req.isVisitorsProfile,
            counts: {
                postCount: req.postCount,
                followerCount: req.followerCount,
                followingCount: req.followingCount
            }
        })
    } catch(e) {
        console.log("Error")
        res.render("404")
    }
}


exports.apiLogin = function(req, res) {
    let user = new User(req.body)
    // user.login(function(result) {               // Solution: This is using a callback Solution. This is the traditional way of doing things
    //     res.send(result)
    // })                        
    
    // Remmeber its the Model and not the controller handling the business Logic
    user.login().then(function(result) {

        // Here we want to send a Token is password is correct SEEN on POSTMAN
        // process.env.JWTSECRET refers to the Env variable for our secret pass phrase
        res.json(jwt.sign({_id: user.data._id}, process.env.JWTSECRET, {expiresIn: "30m"}))

    }).catch(function(e) {
        res.json("Fail Authentication")
    })         // then() executes if promise was successful and catch() executes if promise has failed
}


exports.apiMustBeLoggedIn = function(req, res, next) {

    try {
        // We need to check if the token is legit
        // We need to pass in the secret phrase for verifcation and comparison
        req.apiUser = jwt.verify(req.body.token, process.env.JWTSECRET)
        next()

        // the Next() will allow us to access "req.apiUser"

    } catch {
        req.json("Token Not Valid")
    }
}

exports.apiGetPostsByUsername = async function (req, res) {
    try {
        let authorDoc = await User.findByUsername(req.params.username)
        let posts = await Post.findByAuthorId(authorDoc._id)
        res.json(posts)
    } catch {
        res.json("Sorry, invalid user requested")
    }
}