const userCollection = require("../db").db().collection("users")    // Reports the CLIENT anD NOT  the DB itself
const followCollection = require("../db").db().collection("follows") 
const ObjectId = require("mongodb").ObjectID
const User = require("./User")

let Follow = function(followedUsername, authorId) {
    this.followedUsername = followedUsername
    this.authorId = authorId
    this.errors = []
}


Follow.prototype.cleanUp = async function() {
    if (typeof(this.followedUsername) != "string") {
        this.followedUsername = ""
    }
}

Follow.prototype.validate = async function(action) {
    // Follow username must exists in DB
    let followedAccount = await userCollection.findOne({username: this.followedUsername})

    // Add user is does not exists
    if (followedAccount) {
        this.followedId = followedAccount._id
    } else {
        this.errors.push("Error - Cannot follow user not in DB")
    }

    let doesFollowAlreadyExist = await followCollection.findOne({
        followedId: this.followedId,
        authorId: new ObjectId(this.authorId)
    })

    if(action == "create") {
        if(doesFollowAlreadyExist) {
            this.errors.push("Error - Already Following user")
        }
    } else if(action == "delete") {
        if(!doesFollowAlreadyExist) {
            this.errors.push("Error - Already Unfollowed User")
        }
    }

    // You should not be able to follow yourself
    if (this.followedId.equals(this.authorId)) {
        this.errors("Error - Cannot follow yourself")
    }

}

Follow.prototype.create = function() {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        await this.validate("create")

        if (!this.errors.length) {
            // Store onto DB HERE !!!!!!!!!!!!!!!!!!!!!!!
            await followCollection.insertOne(
                {followedId: this.followedId,
                authorId: new ObjectId(this.authorId)}
            )
            resolve()
        } else {
            reject(this.errors)
        }

    })
}


Follow.prototype.delete = function() {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        await this.validate("delete")

        if (!this.errors.length) {
            // Delete Element from DB HERE !!!!!!!!!!!!!!!!!!!!!!!
            await followCollection.deleteOne(
                {followedId: this.followedId,
                authorId: new ObjectId(this.authorId)}
            )
            resolve()
        } else {
            reject(this.errors)
        }

    })
}


Follow.isVisitorFollowing = async function(followedId, visitorId) {
    let followDoc = await followCollection.findOne({followedId: followedId, authorId: new ObjectId(visitorId)})
    if(followDoc) {
        return true
    }

    return false
}


Follow.getFollowersById = function(id) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("Hereee")
            let followers = await followCollection.aggregate([
                {$match: {followedId: id}},
                {$lookup: {from: "users", localField: "authorId", foreignField: "_id", as: "userDoc"}},
                {$project: {
                    username: {$arrayElemAt: ["$userDoc.username", 0]},
                    email: {$arrayElemAt: ["$userDoc.email", 0]}
                }}
            ]).toArray()
            followers = followers.map(function(follower) {
                let user = new User(follower, true)     // Setting true will enable to find gravatar based off email address
                return {username: follower.username, avatar: user.avatar}
            })

            resolve(followers)

        } catch {
            reject()
        }
    })
}

module.exports = Follow