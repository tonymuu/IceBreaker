# load the libs
mongoose = require 'mongoose'
ObjectId = mongoose.Schema.Types.ObjectId

# define Schema
mediaSchema = mongoose.Schema(
  user_id: # this will refer to the users model's ObjectId?
    type: ObjectId
    ref: 'User'
  event_id:
    type: ObjectId
    ref: 'Event'
  is_video:
    type: Boolean
    default: false
  stored_path:
    type: String
    default: ""
  likes:
    type: Number
    default: 0
  voted_members: [
    type: ObjectId
    ref: 'User'
  ])


module.exports = mongoose.model('Media', mediaSchema)
