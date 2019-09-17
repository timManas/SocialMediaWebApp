const bcyptjs = require("bcryptjs")
const usersCollection = require("../db").db().collection("users")       // This creates a collection on MongoDB   
const validator = require("validator")
const md5 = require("md5")

// Constructor
let User = function (data, getAvatar) {
    this.data = data
    this.errors = []

    if(getAvatar == undefined) {
        getAvatar = false
    }

    if(getAvatar){
        this.getAvatar()
    }
}

// We clean up the data here
User.prototype.cleanup = function () {
    if (typeof (this.data.username) != "string") { this.data.username = "" }
    if (typeof (this.data.email) != "string") { this.data.email = "" }
    if (typeof (this.data.password) != "string") { this.data.password = "" }

    // Gets rid of Bogus properties (incase some array or javascript is inputted and submitted)
    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }
}

User.prototype.login = function () {

    // // Traditional Call Back Functionality  ...We use this to compare to Promises
    // this.cleanup()
    // usersCollection.findOne({username: this.data.username}, (err, attemptedUser) => {
    //     if (attemptedUser && attemptedUser.password == this.data.password ) {
    //         callback("Congrats")
    //     } else {
    //         callback("Error login")
    //     }
    // })                // This is the Collection currently inside the database

    // Return a new object which is a promise 
    return new Promise((resolve, reject) => {
        // We can perform asynchronous actions. When those functions have been completed, 
        // Then we can call resolve or Reject

        this.cleanup()
        usersCollection.findOne({ username: this.data.username }).then((attemptedUser) => {
            if (attemptedUser && bcyptjs.compareSync(this.data.password, attemptedUser.password)) { // bcyptjs.compareSync() Compares password from DB to password typed
                this.data = attemptedUser
                this.getAvatar()
                resolve("Congrats")
            } else {
                reject("Error login")
            }
        }).catch(function () {
            reject("Pleae try again later")
        })                // This is the Collection currently inside the database
    })
}

// Validate the password here
User.prototype.validate = function() {
    return new Promise(async (resolve, reject) => {
        if (this.data.username == "") { this.errors.push("Username missing") }
        if (!validator.isEmail(this.data.email)) { this.errors.push("Email missing") }
        if (this.data.password == "") { this.errors.push("Password missing") }
        if (this.data.password.length > 0 && this.data.password.length < 4) { this.errors.push("Password needs to be min 4 character") }
        if (this.data.username.length > 0 && this.data.username.length < 4) { this.errors.push("Username needs to be min 4 character") }
    
        // Check is username is already taken
        if (this.data.username.length > 2 &&
            this.data.username.length < 30 &&
            validator.isAlphanumeric(this.data.username)) {
    
            let userNameExist = await usersCollection.findOne({ username: this.data.username }) // Check db to see if document exists
            if (userNameExist) {
                this.errors.push("Username Taken")
            }
        }
    
        // Check if Email exists
        if (validator.isAlphanumeric(this.data.username)) {
            let userEmailExist = await usersCollection.findOne({ email: this.data.email }) // Check db to see if document exists
            if (userEmailExist) {
                this.errors.push("Email Already Taken")
            }
        }

        resolve()
        
    })
}

// Register the user into the database
User.prototype.register = function () {
    return new Promise (async (resolve, reject) => {
            // Step1: Validate User Data
            this.cleanup()
            await this.validate()
        
            // Step2:  Only if no validation errors
            if (!this.errors.length) {
        
                // Hash Userpassword 
                let salt = bcyptjs.genSaltSync(10)
                this.data.password = bcyptjs.hashSync(this.data.password, salt)
        
                // Step3: Save user data into database
                await usersCollection.insertOne(this.data)

                this.getAvatar()        
                resolve()
            } else {
                reject(this.errors)
            }
    })
}

User.prototype.getAvatar = function () {
    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`
}

User.findByUsername = function(username) {
    return new Promise(function(resolve, reject) {

        // Make sure input is valid and not malicious
        if (typeof(username) != "string") {
            reject()
            return
        }
        usersCollection.findOne({username: username}).then(function(userDoc) {
            if(username) {
                // Filter properties in UserDoc to avoid sending password
                userDoc = new User(userDoc, true)       // Set to true will get the avatar based on their email address
                userDoc = {
                    _id: userDoc.data._id,
                    username: userDoc.data.username,
                    avatar: userDoc.avatar
                }

                // NOTE: The reason we dont want to just pass in UserDoc is because we have password in UserDoc
                // Hence we have to format userdoc
                resolve(userDoc)       
            } else {
                
                reject() 
            }
        }).catch(function() {
            reject()
        })

    })
}

// Do not cross this
module.exports = User