(function() {
  var ObjectId, bcrypt, mongoose, userSchema;

  mongoose = require('mongoose');

  bcrypt = require('bcrypt-nodejs');

  ObjectId = mongoose.Schema.Types.ObjectId;

  userSchema = mongoose.Schema({
    local: {
      email: String,
      password: String
    },
    facebook: {
      id: String,
      token: String,
      email: String,
      name: String,
      picture: String,
      events: [
        {
          type: ObjectId,
          ref: 'Event'
        }
      ]
    }
  });

  userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
  };

  module.exports = mongoose.model('User', userSchema);

}).call(this);
