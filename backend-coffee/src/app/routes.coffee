Event = require '../app/models/interest'
User = require '../app/models/user'

module.exports = (app, passport) ->

  app.get('/auth/facebook/token', passport.authenticate('facebook-token'), (req, res) ->
    return res.send(200))

  app.post('/gen_test_user', (req, res) ->
    user = new User()
    user.id = '0'
    user.token = '0'
    user.email = 'test@test.net'
    user.name = 'tester'
    user.picture = ''
    user.bio = 'nothing'
    user.save (err, user) ->
      if err? then return console.log err
      res.send(200))

  app.post('/update_location', isLoggedIn, (req, res) ->
    userId = req.user._id
    User.findById(userId).exec (err, user) ->
        if err? then return console.log err
        user.location.latitude = req.query.latitude
        user.location.longitude = req.query.longitude
        user.save (err, user) ->
          if err? then return console.log err
          res.send(200))

  app.post('/update_info', isLoggedIn, (req, res) ->
    userId = req.user._id
    User.findById(userId).exec (err, user) ->
        if err? then return console.log err
        user.bio = req.query.info 
        user.save (err, user) ->
          if err? then return console.log err
          res.send(200))

  app.post('/update_interest', isLoggedIn, (req, res) ->
    userId = req.user._id
    User.findById(userId).exec (err, user) ->
        if err? then return console.log err
        user.interests[req.query.id] = req.query.new_interest
        user.save (err, user) ->
          if err? then return console.log err
          res.send(200))

  app.post('/get_peers', isLoggedIn, (req, res) ->
    console.log req.query.ids
    ids = req.query.ids.toString().split("'")
    console.log ids
    User.find({ id: { $in: ids } }).exec (err, users) ->
      if err? then return console.log err
      res.send(users))

  # app.post('/create_media', isLoggedIn, (req, res) ->
  #   newMedia = new Media()
  #   newMedia.user_id = req.user._id
  #   newMedia.event_id = req.body.eventId
  #   newMedia.stored_path = req.body.storedPath
  #   newMedia.is_video = req.body.isVideo?
  #   newMedia.save (err, media) ->
  #     if err? then return console.log err
  #     addMediaToEvent(media.event_id, media._id)
  #     res.send(200))

  # app.get('/event_medias', isLoggedIn, (req, res) ->
  #   eventId = req.query.eventId
  #   Event.findById(eventId).populate("media_ids").exec (err, event) ->
  #     if err? then return console.log err
  #     event.media_ids.sort (a, b) ->
  #       return b.likes - a.likes
  #     options = path: 'media_ids.user_id', model: 'User'
  #     Event.populate(event, options, (err, event) ->
  #       if err then console.log err
  #       res.send(event.media_ids)))

  # app.get('/my_medias', isLoggedIn, (req, res) ->
  #   userId = req.user._id
  #   Media.find( 'user_id': userId ).populate('stored_path').exec (err, medias) ->
  #     if err? then return console.log err
  #     else
  #       res.send(medias))

  # app.post('/vote_media', isLoggedIn, (req, res) ->
  #   userId = req.user._id
  #   mediaId = req.body.mediaId
  #   likes = req.body.likes
  #   voteMedia(mediaId, userId, likes)
  #   res.send(200))

  # app.post('/create_event', isLoggedIn, (req, res) ->
  #   newEvent = new Event()
  #   if err? then return console.log err
  #   newEvent.admin = req.user._id
  #   newEvent.name = req.body.eventName
  #   newEvent.size = req.body.eventSize
  #   newEvent.save (err, event) ->
  #     if err? then return console.log err
  #     else
  #       addUserToEvent(req.user._id, event._id)
  #       addEventToUser(req.user._id, event._id)
  #       return res.send(200))

  # app.get('/search_events', isLoggedIn, (req, res) ->
  #   eventName = req.query.eventName
  #   Event.find('name': eventName).populate('admin').exec (err, events) ->
  #     if err? then return console.log err
  #     return res.send(events))

  # app.post('/join_event', isLoggedIn, (req, res) ->
  #   userId = req.user._id
  #   eventId = req.body.eventId
  #   User.findOne('_id': userId).exec (err, user) ->
  #     if err? then return console.log err
  #     if user.facebook.events.indexOf(eventId) > -1 then res.send(304)
  #     else
  #       addUserToEvent(req.user._id, eventId)
  #       addEventToUser(req.user._id, eventId)
  #       res.send(200))

  # app.post('/exit_event', isLoggedIn, (req, res) ->
  #   eventId = req.body.eventId
  #   removeUserFromEvent(req.user._id, eventId))

  # app.get('/joined_events', isLoggedIn, (req, res) ->
  #   userId = req.user._id
  #   User.findById(userId).populate('facebook.events').exec (err, user) ->
  #     if err? then return console.log err
  #     res.send(user))

# route middleware to make sure a user is logged in
isLoggedIn = (req, res, next) ->
  if req.isAuthenticated() then return next()
  else res.redirect('/')

# addUserToEvent = (userId, eventId) ->
#   condition = '_id': eventId
#   query = $push: "member_ids": userId
#   Event.update(condition, query, (err, numAffected) ->
#     if err? then console.log err)

# addEventToUser = (userId, eventId) ->
#   condition = '_id': userId
#   query = $push: "facebook.events": eventId
#   User.update(condition, query, (err, numAffected) ->
#     if err? then console.log err)

# removeUserFromEvent = (userId, eventId) ->
#   condition = '_id': eventId
#   query = $pullAll: "member_ids": userId
#   Event.findOneAndUpdate(condition, query, (err, numAffected) ->
#     if err? then console.log err)

# addMediaToEvent = (eventId, mediaId) ->
#   condition = '_id': eventId
#   query = $push: 'media_ids': mediaId
#   Event.findOneAndUpdate(condition, query, (err, numAffected) ->
#     if err? then console.log err)

# voteMedia = (mediaId, userId, likes) ->
#   Media.findById(mediaId).exec (err, media) ->
#     if err then console.log err
#     if media.voted_members.indexOf(userId) == -1
#       media.likes = likes
#       media.voted_members.push userId
#       media.save (err, media) ->
#         if err then console.log err
