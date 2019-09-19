const postCollection = require("../db").db().collection("posts")    // Exports MongoDB Client so we do any operations 
const ObjectID = require("mongodb").ObjectID        // We pass in string Id here and return ObjectID type
const User = require("./User")
const sanitizeHTML = require("sanitize-html")

let Post = function(data, userid, requestedPostId) {
    this.data = data
    this.errors = []
    this.userid = userid
    this.requestedPostId = requestedPostId
}

Post.prototype.cleanUp = function() {
    if (typeof(this.data.title) != "string") {this.data.title = ""}
    if (typeof(this.data.body) != "string") {this.data.body = ""}

    // Get rid of any bogus properties
    this.data = {
        title: sanitizeHTML(this.data.title.trim(), {allowedTags: [], allowedAttributes: {}}),
        body: sanitizeHTML(this.data.body.trim(), {allowedTags: [], allowedAttributes: {}}),
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

            postCollection.insertOne(this.data).then((info) => {
                resolve(info.ops[0]._id)    // This will return the id when the post is created
            }).catch(() => {
                this.errors.push("Please try again later")
                reject(this.errors)
            })
            
        } else {
            reject(this.errors)            
        }
    })

}

Post.prototype.update =   function () {
    return new Promise(async (resolve, reject) => {
        try {

            // We check the post if it belongs to the proper user
            let post = await Post.findSingleById(this.requestedPostId, this.userid)
            if (post.isVisitorOwner) {
                let status = await this.actuallyUpdate()
                resolve(status)
            } else {
                reject()
            }
        } catch {
            reject()
        }
    })
}

// Updates the database when a user edits a posts
Post.prototype.actuallyUpdate = function() {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        this.validate()
        if (!this.errors.length) {
            await postCollection.findOneAndUpdate(
                {_id: new ObjectID(this.requestedPostId)}, 
                {$set: {title: this.data.title, body: this.data.body}}
            )
            resolve("success")
        } else {
            resolve("failure")
        }
    
    })
}


// TODO :: We dont include the Prototype here ... why ? 
// reusablePostQuery is Used multiple times on findSingleById and findAuthorById
Post.reusablePostQuery = function(unqiueOperations, visitorId) {
    return new Promise(async function(resolve, reject) {        // We have async since there is DB call

        let aggOperations = unqiueOperations.concat([
            {$lookup: {from: "users", localField: "author", foreignField: "_id", as: "authorDocument"}},
            {$project: {            // Project allows us to dictate what fields we want to have. It FILTERS out unwanted content
                title:1,
                body:1,
                createdDate:1,
                authorId: "$author",     // We need this because we need to specify the authorId in the post
                author:{$arrayElemAt: ["$authorDocument", 0]},
            }}
        ])

        //  Note - Id is valid at this point
        // let post = await postCollection.findOne({_id: new ObjectID(id)})
        // We use aggregate instead of findOne when we want to do multiple complex operations
        let posts = await postCollection.aggregate(aggOperations).toArray()    
        
        
        
        // Clean up author property in each post object
        // Map returns an array
        posts = posts.map(function(post) {
            post.isVisitorOwner = post.authorId.equals(visitorId)
            post.authorId = undefined
            post.author = {
                username: post.author.username,
                avatar: new User(post.author, true).avatar
            }
            return post
        })
        
        resolve(posts)

    })
}


// TODO :: We dont include the Prototype here ... why ? 
Post.findSingleById = function(id, visitorId) {
    return new Promise(async function(resolve, reject) {        // We have async since there is DB call

        if (typeof(id) != "string" || !ObjectID.isValid(id)) {
            reject()
            return
        }

        let posts = await Post.reusablePostQuery([
            {$match: {_id: new ObjectID(id)}}
        ], visitorId)
        
        // Actually post the result
        if (posts.length) {
            console.log(posts[0])
            resolve(posts[0])           // Return first item in the array
        } else {
            reject()
        }

    })
}

// Remember these are going to an aggregate
// The database is performing these actions 
// Fetch matching author with authorId
// Sorts it out as well
Post.findByAuthorId = function(authorId) {
    return Post.reusablePostQuery([
        {$match: {author: authorId}},
        {$sort: {createdDate: -1}}
    ])
}


Post.delete = function(postIdToDelete, currentUserId) {
    return new Promise(async (resolve, reject) => {
        try {
            let post = await Post.findSingleById(postIdToDelete, currentUserId)

            if (post.isVisitorOwner) {
                await postCollection.deleteOne({_id: new ObjectID(postIdToDelete)})
                resolve() 
                
            } else {
                reject()
            }
        } catch {
            reject()
        }
    })
}


Post.search = function(searchTerm) {
    return new Promise(async (resolve, reject) => {

        if(typeof(searchTerm) == "string") {

            // This will an expensiver operation to perform since searching will search all items 
            let posts = await Post.reusablePostQuery([
                {$match: {$text: {$search: searchTerm}}},
                {$sort: {score: {$meta: "textScore"}}} 
            ])
            resolve(posts)
        } else {
            reject()
        }

    })
}

module.exports = Post       // Rememeber we want to return THIS OBJECT  !!!!!!! 