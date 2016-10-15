# load the libs
mongoose = require 'mongoose'
ObjectId = mongoose.Schema.Types.ObjectId

# define Schema
interestSchema = mongoose.Schema(
  user_id: # this will refer to the users model's ObjectId?
    type: ObjectId
    ref: 'User'
  genre: String
  value: String)


module.exports = mongoose.model('Interest', interestSchema)
