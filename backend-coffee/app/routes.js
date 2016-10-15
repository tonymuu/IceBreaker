(function() {
  var Event, User, isLoggedIn;

  Event = require('../app/models/interest');

  User = require('../app/models/user');

  module.exports = function(app, passport) {
    app.get('/auth/facebook/token', passport.authenticate('facebook-token'), function(req, res) {
      return res.send(200);
    });
    app.post('/gen_test_user', function(req, res) {
      var user;
      user = new User();
      user.id = '0';
      user.token = '0';
      user.email = 'test@test.net';
      user.name = 'tester';
      user.picture = '';
      user.bio = 'nothing';
      return user.save(function(err, user) {
        if (err != null) {
          return console.log(err);
        }
        return res.send(200);
      });
    });
    app.post('/update_location', isLoggedIn, function(req, res) {
      var userId;
      userId = req.user._id;
      return User.findById(userId).exec(function(err, user) {
        if (err != null) {
          return console.log(err);
        }
        user.location.latitude = req.query.latitude;
        user.location.longitude = req.query.longitude;
        return user.save(function(err, user) {
          if (err != null) {
            return console.log(err);
          }
          return res.send(200);
        });
      });
    });
    app.post('/update_info', isLoggedIn, function(req, res) {
      var userId;
      userId = req.user._id;
      return User.findById(userId).exec(function(err, user) {
        if (err != null) {
          return console.log(err);
        }
        user.bio = req.query.info;
        return user.save(function(err, user) {
          if (err != null) {
            return console.log(err);
          }
          return res.send(200);
        });
      });
    });
    app.post('/update_interest', isLoggedIn, function(req, res) {
      var userId;
      userId = req.user._id;
      return User.findById(userId).exec(function(err, user) {
        if (err != null) {
          return console.log(err);
        }
        user.interests[req.query.id] = req.query.new_interest;
        return user.save(function(err, user) {
          if (err != null) {
            return console.log(err);
          }
          return res.send(200);
        });
      });
    });
    return app.post('/get_peers', function(req, res) {
      var ids;
      console.log(req.query.ids);
      ids = req.query.ids.toString().split("'");
      console.log(ids);
      return User.find({
        id: {
          $in: ids
        }
      }).exec(function(err, users) {
        if (err != null) {
          return console.log(err);
        }
        return res.send(users);
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

}).call(this);
