(function() {
  var Event, Media, User, addEventToUser, addMediaToEvent, addUserToEvent, isLoggedIn, removeUserFromEvent, voteMedia;

  Media = require('../app/models/media');

  Event = require('../app/models/event');

  User = require('../app/models/user');

  module.exports = function(app, passport) {
    app.get('/auth/facebook/token', passport.authenticate('facebook-token'), function(req, res) {
      return res.send(200);
    });
    app.get('/find_user', isLoggedIn, function(req, res) {
      var userId;
      userId = req.query.userId;
      return User.findById(userId).exec(function(err, user) {
        if (err != null) {
          return console.log(err);
        }
        return res.send(user);
      });
    });
    app.post('/create_media', isLoggedIn, function(req, res) {
      var newMedia;
      newMedia = new Media();
      newMedia.user_id = req.user._id;
      newMedia.event_id = req.body.eventId;
      newMedia.stored_path = req.body.storedPath;
      newMedia.is_video = req.body.isVideo != null;
      return newMedia.save(function(err, media) {
        if (err != null) {
          return console.log(err);
        }
        addMediaToEvent(media.event_id, media._id);
        return res.send(200);
      });
    });
    app.get('/event_medias', isLoggedIn, function(req, res) {
      var eventId;
      eventId = req.query.eventId;
      return Event.findById(eventId).populate("media_ids").exec(function(err, event) {
        var options;
        if (err != null) {
          return console.log(err);
        }
        event.media_ids.sort(function(a, b) {
          return b.likes - a.likes;
        });
        options = {
          path: 'media_ids.user_id',
          model: 'User'
        };
        return Event.populate(event, options, function(err, event) {
          if (err) {
            console.log(err);
          }
          return res.send(event.media_ids);
        });
      });
    });
    app.get('/my_medias', isLoggedIn, function(req, res) {
      var userId;
      userId = req.user._id;
      return Media.find({
        'user_id': userId
      }).populate('stored_path').exec(function(err, medias) {
        if (err != null) {
          return console.log(err);
        } else {
          return res.send(medias);
        }
      });
    });
    app.post('/vote_media', isLoggedIn, function(req, res) {
      var likes, mediaId, userId;
      userId = req.user._id;
      mediaId = req.body.mediaId;
      likes = req.body.likes;
      voteMedia(mediaId, userId, likes);
      return res.send(200);
    });
    app.post('/create_event', isLoggedIn, function(req, res) {
      var newEvent;
      newEvent = new Event();
      if (typeof err !== "undefined" && err !== null) {
        return console.log(err);
      }
      newEvent.admin = req.user._id;
      newEvent.name = req.body.eventName;
      newEvent.size = req.body.eventSize;
      return newEvent.save(function(err, event) {
        if (err != null) {
          return console.log(err);
        } else {
          addUserToEvent(req.user._id, event._id);
          addEventToUser(req.user._id, event._id);
          return res.send(200);
        }
      });
    });
    app.get('/search_events', isLoggedIn, function(req, res) {
      var eventName;
      eventName = req.query.eventName;
      return Event.find({
        'name': eventName
      }).populate('admin').exec(function(err, events) {
        if (err != null) {
          return console.log(err);
        }
        return res.send(events);
      });
    });
    app.post('/join_event', isLoggedIn, function(req, res) {
      var eventId, userId;
      userId = req.user._id;
      eventId = req.body.eventId;
      return User.findOne({
        '_id': userId
      }).exec(function(err, user) {
        if (err != null) {
          return console.log(err);
        }
        if (user.facebook.events.indexOf(eventId) > -1) {
          return res.send(304);
        } else {
          addUserToEvent(req.user._id, eventId);
          addEventToUser(req.user._id, eventId);
          return res.send(200);
        }
      });
    });
    app.post('/exit_event', isLoggedIn, function(req, res) {
      var eventId;
      eventId = req.body.eventId;
      return removeUserFromEvent(req.user._id, eventId);
    });
    return app.get('/joined_events', isLoggedIn, function(req, res) {
      var userId;
      userId = req.user._id;
      return User.findById(userId).populate('facebook.events').exec(function(err, user) {
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
