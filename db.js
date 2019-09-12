const mongodb = require("mongodb")      // Remember you need to install Mongodb first using npm
const connectionString = "mongodb+srv://timmanas:Apple@cluster0-9czdc.mongodb.net/ComplexApp?retryWrites=true&w=majority"

mongodb.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true},function(err, client) {
    module.exports = client.db()    // This allows us to export this one database to whatever files "requires"
   const app = require("./app")
   app.listen(3000)             // The APPPLICATION WILL NOT START UNLESS Connection to DB is established
})               