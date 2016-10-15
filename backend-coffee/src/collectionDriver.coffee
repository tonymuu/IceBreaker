ObjectID = require('mongodb').ObjectID

module.exports = class @CollectionDriver

  constructor: (db) ->
    CollectionDriver.db = db

  getCollection = (collectionName, callback) ->
    CollectionDriver.db.collection(collectionName, (error, the_collection) ->
      if error? then callback(error)
      else callback(null, the_collection))

  findAll: (collectionName, callback) ->
    getCollection(collectionName, (error, the_collection) ->
      if error then callback error
      else
        the_collection.find().toArray (error, results) ->
          if error then callback error
          else callback(null, results))

  get: (collectionName, id, callback) ->
    getCollection(collectionName, (error, the_collection) ->
      if error then callback error
      else
        checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$")
        if !checkForHexRegExp.test id then callback {error: "invalid id"}
        else the_collection.findOne({'_id': ObjectID(id)}, (error, doc) ->
          if error then callback error
          else callback(null, doc)))

  save: (collectionName, obj, callback) ->
    getCollection(collectionName, (error, the_collection) ->
      if error then callback error
      else
        obj.created_at = new Date()
        the_collection.insert(obj, -> callback(null, obj)))

  update: (collectionName, obj, id, callback) ->
    getCollection(collectionName, (error, the_collection) ->
      if error? then callback error
      else
        obj._id = ObjectID id
        obj.updated_at = new Date()
        the_collection.save(obj, (error, doc) ->
          if error? then callback error
          else callback(null, obj)))

  delete: (collectionName, id, callback) ->
    getCollection(collectionName, (error, the_collection) ->
      if error? then callback error
      else
        the_collection.remove({ '_id': ObjectID id }, (error, doc) ->
          if error? callback error
          else callback(null, doc)))
