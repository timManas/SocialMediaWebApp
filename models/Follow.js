const userCollection = require("../db").db().collection("users")    // Reports the CLIENT anD NOT  the DB itself
const followCollection = require("../db").db().collection("follows") 
const ObjectId = require("mongodb").ObjectID

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

Follow.prototype.validate = async function() {
    // Follow username must exists in DB
    let followedAccount = await userCollection.findOne({username: this.followedUsername})

    // Add user is does not exists
    if (followedAccount) {
        this.followedId = followedAccount._id
    } else {
        this.errors.push("Error - Cannot follow user not in DB")
    }

}

Follow.prototype.create = function() {
    return new Promise(async (resolve, reject) => {
        this.cleanUp()
        await this.validate()

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


Follow.isVisitorFollowing = async function(followedId, visitorId) {
    let followDoc = await followCollection.findOne({followedId: followedId, authorId: new ObjectId(visitorId)})
    if(followDoc) {
        return true
    }

    return false
}

module.exports = Follow