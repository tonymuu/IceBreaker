(function() {
  var FacebookStrategy, FacebookTokenStrategy, LocalStrategy, User, configAuth;

  LocalStrategy = require('passport-local').Strategy;

  FacebookStrategy = require('passport-facebook').Strategy;

  FacebookTokenStrategy = require('passport-facebook-token');

  User = require('../app/models/user');

  configAuth = require('./auth.js');

  module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
      return done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
      return User.findById(id, function(err, user) {
        return done(err, user);
      });
    });
    passport.use(new FacebookTokenStrategy({
      clientID: configAuth.facebookAuth.clientID,
      clientSecret: configAuth.facebookAuth.clientSecret
    }, function(accessToken, refreshToken, profile, done) {
      return User.findOne({
        'facebook.id': profile.id
      }, function(err, user) {
        var newUser;
        if (err != null) {
          return done(err);
        }
        if (user != null) {
          return done(null, user);
        } else {
          newUser = new User();
          newUser.facebook.id = profile.id;
          newUser.facebook.token = accessToken;
          newUser.facebook.name = profile.name.givenName + " " + profile.name.familyName;
          newUser.facebook.email = profile.emails[0].value;
          newUser.facebook.picture = profile.photos[0].value;
          return newUser.save(function() {
            if (err != null) {
              throw err;
            } else {
              return done(null, newUser);
            }
          });
        }
      });
    }));
    passport.use(new FacebookStrategy({
      clientID: configAuth.facebookAuth.clientID,
      clientSecret: configAuth.facebookAuth.clientSecret,
      callbackURL: configAuth.facebookAuth.callbackURL,
      profileFields: ["emails", "photos"]
    }, function(token, refreshToken, profile, done) {
      return process.nextTick(function() {
        return User.findOne({
          'facebook.id': profile.id
        }, function(err, user) {
          var newUser;
          if (err != null) {
            return done(err);
          }
          if (user != null) {
            return done(null, user);
          } else {
            newUser = new User();
            newUser.facebook.id = profile.id;
            newUser.facebook.token = token;
            newUser.facebook.name = profile.name.givenName + " " + profile.name.familyName;
            newUser.facebook.email = profile.emails[0].value;
            newUser.facebook.picture = profile.photos[0].value;
            return newUser.save(function() {
              if (err != null) {
                throw err;
              } else {
                return done(null, newUser);
              }
            });
          }
        });
      });
    }));
    passport.use('local-signup', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    }, function(req, email, password, done) {
      return process.nextTick(function() {
        return User.findOne({
          'local.email': email
        }, function(err, user) {
          var newUser;
          if (err != null) {
            return done(err);
          }
          if (user != null) {
            return done(null, false, req.flash('signupMessage', 'The email has already been taken!'));
          } else {
            newUser = User();
            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);
            return newUser.save(function(err) {
              if (err != null) {
                throw err;
              }
              return done(null, newUser);
            });
          }
        });
      });
    }));
    return passport.use('local-login', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    }, function(req, email, password, done) {
      return User.findOne({
        'local.email': email
      }, function(err, user) {
        if (err != null) {
          return done(err);
        }
        if (user == null) {
          return done(null, false, req.flash('loginMessage', 'No user found.'));
        }
        if (!(user != null ? user.validPassword(password) : void 0)) {
          return done(null, false, req.flash('loginMessage', 'Wrong password.'));
        }
        return done(null, user);
      });
    }));
  };

}).call(this);
