const dotenv = require("dotenv")
dotenv.config()                     // Looks for file called ".env"

const mongodb = require("mongodb")      // Remember you need to install Mongodb first using npm

let connectionString = process.env.CONNECTIONSTRING     // This is how you access Env variables

mongodb.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true},function(err, client) {
    module.exports = client.db()    // This allows us to export this one database to whatever files "requires"
   const app = require("./app")
   app.listen(process.env.PORT)             // The APPPLICATION WILL NOT START UNLESS Connection to DB is established
})               