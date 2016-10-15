# load all things
LocalStrategy = require('passport-local').Strategy
FacebookStrategy = require('passport-facebook').Strategy
FacebookTokenStrategy = require('passport-facebook-token')

User = require '../app/models/user'

configAuth = require './auth.js'

module.exports = (passport) ->
  # passport session setup, for persistent login sessions
  passport.serializeUser (user, done) ->
    done(null, user.id)

  passport.deserializeUser (id, done) ->
    User.findById(id, (err, user) ->
      done(err, user))

  passport.use(new FacebookTokenStrategy({
    clientID: configAuth.facebookAuth.clientID
    clientSecret: configAuth.facebookAuth.clientSecret
    }, (accessToken, refreshToken, profile, done) ->
      User.findOne( 'facebook.id': profile.id, (err, user) ->
        if err? then return done err
        if user? then return done(null, user)
        else
          newUser = new User()
          newUser.facebook.id = profile.id
          newUser.facebook.token = accessToken
          newUser.facebook.name = "#{profile.name.givenName} #{profile.name.familyName}"
          newUser.facebook.email = profile.emails[0].value
          newUser.facebook.picture = profile.photos[0].value
          newUser.save ->
            if err? then throw err
            else return done(null, newUser))))

  passport.use(new FacebookStrategy(
    clientID: configAuth.facebookAuth.clientID
    clientSecret: configAuth.facebookAuth.clientSecret
    callbackURL: configAuth.facebookAuth.callbackURL
    profileFields: ["emails", "photos"]
    (token, refreshToken, profile, done) ->
      process.nextTick ->
        User.findOne( 'facebook.id': profile.id, (err, user) ->
          if err? then return done(err)
          if user? then return done(null, user)
          else
            newUser = new User()
            newUser.facebook.id = profile.id
            newUser.facebook.token = token
            newUser.facebook.name = "#{profile.name.givenName} #{profile.name.familyName}"
            newUser.facebook.email = profile.emails[0].value
            newUser.facebook.picture = profile.photos[0].value
            newUser.save ->
              if err? then throw err
              else return done(null, newUser))))

  passport.use('local-signup', new LocalStrategy(
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true # allows passing back the entire request object to callback
    (req, email, password, done) ->
      # async: User.findOne won't fire unless data is sent back
      process.nextTick ->
        # find a user whose email is the same as the forms email
        User.findOne( 'local.email': email, (err, user) ->
          if err? then return done(err)
          if user? then return done(null, false, req.flash('signupMessage', 'The email has already been taken!'))
          else
            newUser = User()
            newUser.local.email = email
            newUser.local.password = newUser.generateHash(password)
            newUser.save (err) ->
              if err? then throw err
              done(null, newUser))))

  passport.use('local-login', new LocalStrategy(
    usernameField: 'email'
    passwordField: 'password'
    passReqToCallback: true
    (req, email, password, done) ->
      User.findOne( 'local.email': email, (err, user) ->
        if err? then return done(err)
        if !user? then return done(null, false, req.flash('loginMessage', 'No user found.'))
        if !user?.validPassword(password) then return done(null, false, req.flash('loginMessage', 'Wrong password.'))
        done(null, user))))
