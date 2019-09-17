const postCollection = require("../db").db().collection("posts")    // Exports MongoDB Client so we do any operations 
const ObjectID = require("mongodb").ObjectID        // We pass in string Id here and return ObjectID type
const User = require("./User")

let Post = function(data, userid) {
    this.data = data
    this.errors = []
    this.userid = userid
}

Post.prototype.cleanUp = function() {
    if (typeof(this.data.title) != "string") {this.data.title = ""}
    if (typeof(this.data.body) != "string") {this.data.body = ""}

    // Get rid of any bogus properties
    this.data = {
        title: this.data.title.trim(),
        body: this.data.body.trim(),
        createdDate: new Date(),
        
        // author: this.userid             // Best pratice - Dont store this as string of text  but store it as object id object type
        author: ObjectID(this.userid)
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

// TODO :: We dont include the Prototype here ... why ? 
Post.findSingleById = function(id) {
    return new Promise(async function(resolve, reject) {        // We have async since there is DB call

        if (typeof(id) != "string" || !ObjectID.isValid(id)) {
            reject()
            return
        }

        //  Note - Id is valid at this point
        // let post = await postCollection.findOne({_id: new ObjectID(id)})
        // We use aggregate instead of findOne when we want to do multiple complex operations
        let posts = await postCollection.aggregate([
            {$match: {_id: new ObjectID(id)}},
            {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
            {$project: {            // Project allows us to dictate what fields we want to have. It FILTERS out unwanted content
                title:1,
                body:1,
                createdDate:1,
                author:{$arrayElemAt: ["$authorDocument", 0]},
            }}
        ]).toArray()    
        
        
        
        // Clean up author property in each post object
        // Map returns an array
        posts = posts.map(function(post) {
            post.author = {
                username: post.author.username,
                avatar: new User(post.author, true).avatar
            }
            return post
        })
        
        // Actually post the result
        if (posts.length) {
            console.log(posts)
            resolve(posts[0])           // Return first item in the array
        } else {
            reject()
        }

    })
}


module.exports = Post       // Rememeber we want to return THIS OBJECT  !!!!!!! 