const postCollection = require("../db").db().collection("posts")    // Exports MongoDB Client so we do any operations 

let Post = function(data) {
    this.data = data
    this.errors = []
}

Post.prototype.cleanUp = function() {
    if (typeof(this.data.title) != "string") {this.data.title = ""}
    if (typeof(this.data.body) != "string") {this.data.body = ""}

    // Get rid of any bogus properties
    this.data = {
        title: this.data.title.trim(),
        body: this.data.body.trim(),
        createdDate: new Date() 
    }
}

// We only need to validate if the user has any title or content on it 
Post.prototype.validate = function() {
    if (this.data.title == "") {this.errors.push("Title Required")}
    if (this.data.boydy == "") {this.errors.push("Content required to post")}
}

// This funciton needs to return a promise so we can leverage the result in the post controller
Post.prototype.create = function() {
    return new Promise((resolve, reject) => {
        this.cleanUp()
        this.validate()

        if(!this.errors.length) {
            // Save into Database
            // NOTE !! insertOne is a asynchonous Operation. We have no idea how long it will take to store in DB
            // We have two solutions, use then().catch() syntax or async keyword

            postCollection.insertOne(this.data).then(() => {
                resolve()
            }).catch(() => {
                this.errors.push("Please try again later")
                reject(this.errors)
            })
            
        } else {
            reject(this.errors)            
        }
    })


}


module.exports = Post       // Rememeber we want to return THIS OBJECT  !!!!!!! 