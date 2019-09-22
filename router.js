 const express = require("express")
 const router = express.Router()
 const userController = require("./controllers/userController.js")
 const postController = require("./controllers/postController.js")
 const followController = require("./controllers/followController.js")

 // User related routes 
 router.get("/", userController.home)
 router.post("/register", userController.register)
 router.post("/login", userController.login)
 router.post("/logout", userController.logout)


 // Post relted Routes
router.get("/create-post", userController.mustBeLoggedIn, postController.viewCreateScreen)
router.post("/create-post", userController.mustBeLoggedIn, postController.create)
router.get("/post/:id", postController.viewSingle)           // Notice the id !! - Screen for a single post
router.get("/post/:id/edit", userController.mustBeLoggedIn, postController.viewEditScreen)
router.post("/post/:id/edit", userController.mustBeLoggedIn, postController.edit)    // This is for submitting Form data on the edit Screen
router.post("/post/:id/delete", userController.mustBeLoggedIn, postController.delete)    // This is for submitting Form data on the edit Screen
router.post("/search", postController.search)

// Follow Relted Routes
router.post("/addFollow/:username", userController.mustBeLoggedIn, followController.addFollow)
router.post("/removeFollow/:username", userController.mustBeLoggedIn, followController.removeFollow)

// Profile related routes
router.get("/profile/:username", userController.ifUserExists, userController.sharedProfileData, userController.profilePostsScreen)        // the : makes it dynamic and doesent get added to the URL !!! 
router.get("/profile/:username/followers", userController.ifUserExists, userController.sharedProfileData, userController.profileFollowersScreen)        // the : makes it dynamic and doesent get added to the URL !!! 


 module.exports = router            // router is kinda like a new mini express Application