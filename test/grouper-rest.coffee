assert = require 'assert'
asyncMap = (require 'slide').asyncMap
chain = (require 'slide').chain

config = (require 'config') 'test/testconf.json'
need = (require 'flow').need


server = null

config.on 'error', (msg...) -> console.log(msg...)
config.on 'configured', (conf) ->
  # load test fixtures
  #client = conf.hbase()
  stack = (require 'store/stack') conf, (require 'store/hbase')
  stack.on 'available', (store) ->
    client = require('hbase')({port:8890})
    console.log "Trying to load fixtures..."
    fixtures = (require './store/fixtures')
    list = for tableId, contents of fixtures
      [load, client, (conf.tableName tableId), contents]
    chain(list, (err, res) -> console.log("loaded", err, res))

  stack.on 'error', (err) -> throw err

  # server = (require 'grouper-rest').server conf
  #
  # module.exports["test"] = -> true
  # # Actually start running tests
  #
  # stack.on 'available', start



load = (client, tableName, contents, cb) ->
  rows = []
  for key, families of contents
    for family, columns of families
      for qualifier, cell of columns
        cKey = [family, qualifier].join(':')
        if typeof(cell) == "string" or typeof(cell) == "number"
          rows.push {key: key, column: cKey, '$': cell}
        else
          for ts, value of cell
            rows.push {key: key, column: cKey, timestamp: ts, '$': value}
  table = client.getRow tableName, null
  table.put rows, (err, success) ->
    console.log "PUT failed:", err
    cb(err, null)


start = ->
  console.log("Starting to run tests.")
  for k, t of tests
    exports[k] = t

tests =
  'test GET one cluster': (beforeFinish) ->
    req = {method: 'GET', url: '/clusters/will/mid/macbeth', timeout: 1000}
    expected = ["doc3", "doc4", "doc5"]
    check = (res) ->
      actual = (JSON.parse res.body).sort
      assert.eql actual, expected
    assert.response server, req, check

  # 'test GET all clusters A': ->
  #   req = {method: 'GET', url: '/clusters/will/mid'}
  #   check = (res) ->
  #     assert.response server, req, {status: 200}
  #     all = JSON.parse res.body
  #     assert.ok ("macbeth" in all)
  #     assert.ok ("caesar" in all)
  #     assert.ok ("general" in all)
  #     assert.eql all["macbeth"].length, 3
  #     assert.eql all["caesar"].length, 2
  #     assert.eql all["general"].length, 2
  #   assert.response server, req, check
  #
  # 'test GET all clusters B': ->
  #   req = {method: 'GET', url: '/clusters/will/tail'}
  #   check = (res) ->
  #     assert.response server, req, {status: 200}
  #     all = JSON.parse res.body
  #     assert.ok ("macbeth" in all)
  #
  # 'test GET single cluster not found': ->
  #   req = {method: 'GET', url: '/clusters/will/mid/avenue-q'}
  #   assert.response server, req, {status: 404}
  #   req = {method: 'GET', url: '/clusters/will/no-such-coll/macbeth'}
  #   assert.response server, req, {status: 404}
  #
  # 'test GET clusters for collection not found': ->
  #   req = {method: 'GET', url: '/clusters/will/no-such-coll'}
  #   assert.response server, req, {status: 404}
  #
  # 'test POST doc': ->
  #   req =
  #     method: 'POST'
  #     url: '/collections/will/lear'
  #     data: {id: '10', text: 'Have more than thou showest'}
  #   assert.response server, req, {body: "/docs/will/lear/10"}
  #   req =
  #     method: 'POST'
  #     url: '/collections/will/lear'
  #     data: {id: '11', text: 'Speak less than thou knowest'}
  #   assert.response server, req, {body: "/docs/will/lear/11"}
  #
  # 'test POST doc to invalid collections': ->
  #   req =
  #     method: 'POST'
  #     url: '/collections//my-collection'
  #     data: doc
  #   assert.response server, req, {status: 404}
  #   req =
  #     method: 'POST'
  #     url: '/collections/will/'
  #     data: doc
  #   assert.response server, req, {status: 404}
