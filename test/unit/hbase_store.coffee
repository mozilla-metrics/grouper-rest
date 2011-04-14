assert = require 'assert'
check = assert.ok
test_helpers = require '../lib/test_helpers'

storage = require 'storage'
service = require 'service'

{CollectionRef,
 Collection,
 DocumentRef,
 Document} = require 'model'

store = null
test_helpers.setup (err, conf) ->
  if err then throw err

  factory = new storage.StackFactory conf
  factory.push storage.hbase.factory
  factory.build (err, store_) ->
    if err then throw err
    store = store_
    test_helpers.update module.exports, tests


tests =

  "post document": (beforeExit) ->
    done = false
    call = service.createDirectCall (err, success) ->
      check !err
      done = success

    ownerRef = new CollectionRef "will", "mid"
    ref = new DocumentRef ownerRef, "myID"
    document = new Document ref, "The quick brown fox jumpeth."
    store.putDocument document, call

    beforeExit () -> check done
