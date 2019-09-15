 const express = require("express")
 const router = express.Router()
 const userController = require("./controllers/userController.js")
 const postController = require("./controllers/postController.js")

 // User related routes 
 router.get("/", userController.home)
 router.post("/register", userController.register)
 router.post("/login", userController.login)
 router.post("/logout", userController.logout)


 // Post relted Routes
router.get("/create-post", userController.mustBeLoggedIn, postController.viewCreateScreen)
router.post("/create-post", userController.mustBeLoggedIn, postController.create)
router.get("/post/:id", postController.viewSingle)           // Notice the id !! - Screen for a single post




 module.exports = router            // router is kinda like a new mini express Application