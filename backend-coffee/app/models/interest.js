(function() {
  var ObjectId, interestSchema, mongoose;

  mongoose = require('mongoose');

  ObjectId = mongoose.Schema.Types.ObjectId;

  interestSchema = mongoose.Schema({
    user_id: {
      type: ObjectId,
      ref: 'User'
    },
    genre: String,
    value: String
  });

  module.exports = mongoose.model('Interest', interestSchema);

}).call(this);
