(function() {
  var ObjectId, eventSchema, mongoose;

  mongoose = require('mongoose');

  ObjectId = mongoose.Schema.Types.ObjectId;

  eventSchema = mongoose.Schema({
    name: String,
    size: Number,
    admin: {
      type: ObjectId,
      ref: 'User'
    },
    date_create: {
      type: Date,
      defalt: Date.now
    },
    date_start: {
      type: Date,
      "default": Date.now
    },
    date_end: {
      type: Date,
      "default": Date.now
    },
    member_ids: [
      {
        type: ObjectId,
        ref: 'User'
      }
    ],
    media_ids: [
      {
        type: ObjectId,
        ref: 'Media'
      }
    ]
  });

  module.exports = mongoose.model('Event', eventSchema);

}).call(this);
