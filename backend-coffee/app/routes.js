(function() {
  var Event, User, addEventToUser, addMediaToEvent, addUserToEvent, isLoggedIn, removeUserFromEvent, voteMedia;

  Event = require('../app/models/interest');

  User = require('../app/models/user');

  module.exports = function(app, passport) {
    app.get('/auth/facebook/token', passport.authenticate('facebook-token'), function(req, res) {
      return res.send(200);
    });
    app.post('/add_user', isLoggedIn, function(req, res) {
      var id;
      id = req.user._id;
      return User.findById(id).exec(function(err, user) {
        if (err != null) {
          return console.log(err);
        }
        user.picture = req.query.image_url;
        user.email = req.query.email;
        user.token = req.query.token;
        user.name = req.query.name;
        return user.save(function(err, user) {
          if (err != null) {
            return console.log(err);
          }
          return res.send(user);
        });
      });
    });
    app.post('/update_location', isLoggedIn, function(req, res) {
      var userId;
      userId = req.query._id;
      return User.findById(peerId).exec(function(err, user) {
        if (err != null) {
          return console.log(err);
        }
        user.location = req.query.location;
        return user.save(function(err, user) {
          if (err != null) {
            return console.log(err);
          }
          return res.send(200);
        });
      });
    });
    return app.get('/get_user', isLoggedIn, function(req, res) {
      var userId;
      userId = req.query.userId;
      return User.findById(userId).exec(function(err, user) {
        if (err != null) {
          return console.log(err);
        }
        return res.send(user);
      });
    });
  };

  isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      return res.redirect('/');
    }
  };

  addUserToEvent = function(userId, eventId) {
    var condition, query;
    condition = {
      '_id': eventId
    };
    query = {
      $push: {
        "member_ids": userId
      }
    };
    return Event.update(condition, query, function(err, numAffected) {
      if (err != null) {
        return console.log(err);
      }
    });
  };

  addEventToUser = function(userId, eventId) {
    var condition, query;
    condition = {
      '_id': userId
    };
    query = {
      $push: {
        "facebook.events": eventId
      }
    };
    return User.update(condition, query, function(err, numAffected) {
      if (err != null) {
        return console.log(err);
      }
    });
  };

  removeUserFromEvent = function(userId, eventId) {
    var condition, query;
    condition = {
      '_id': eventId
    };
    query = {
      $pullAll: {
        "member_ids": userId
      }
    };
    return Event.findOneAndUpdate(condition, query, function(err, numAffected) {
      if (err != null) {
        return console.log(err);
      }
    });
  };

  addMediaToEvent = function(eventId, mediaId) {
    var condition, query;
    condition = {
      '_id': eventId
    };
    query = {
      $push: {
        'media_ids': mediaId
      }
    };
    return Event.findOneAndUpdate(condition, query, function(err, numAffected) {
      if (err != null) {
        return console.log(err);
      }
    });
  };

  voteMedia = function(mediaId, userId, likes) {
    return Media.findById(mediaId).exec(function(err, media) {
      if (err) {
        console.log(err);
      }
      if (media.voted_members.indexOf(userId) === -1) {
        media.likes = likes;
        media.voted_members.push(userId);
        return media.save(function(err, media) {
          if (err) {
            return console.log(err);
          }
        });
      }
    });
  };

}).call(this);
