const usersCollection = require("../db").collection("users")
const validator = require("validator")

// Constructor
let User = function(data) {
    this.data = data
    this.errors = []
}

User.prototype.cleanup = function() {
    if(typeof(this.data.username) != "string") {this.data.username = ""}
    if(typeof(this.data.email) != "string") {this.data.email = ""}
    if(typeof(this.data.password) != "string") {this.data.password = ""}

    // Gets rid of Bogus properties (incase some array or javascript is inputted and submitted)
    this.data = {
        username: this.data.username.trim().toLowerCase(),
        email: this.data.email.trim().toLowerCase(),
        password: this.data.password
    }

    // This actually 
}

User.prototype.validate = function() {
    if (this.data.username == "") {this.errors.push("Username missing")}

    if (!validator.isEmail(this.data.email)) {this.errors.push("Email missing")}

    if (this.data.password == "") {this.errors.push("Password missing")}
    if (this.data.password.length > 0 && this.data.password.length < 4) {this.errors.push("Password needs to be min 4 character")}
    if (this.data.username.length > 0 && this.data.username.length < 4) {this.errors.push("Username needs to be min 4 character")}
    
}

User.prototype.register = function() {

    // Step1: Validate User Data
    this.cleanup()
    this.validate()
    
    // Step2:  Only if no validation errors
    if (!this.errors.length) {

        // Step3: Save user data into database
        usersCollection.insertOne(this.data)
    }

    
}
module.exports = User