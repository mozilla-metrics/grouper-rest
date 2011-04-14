assert = require 'assert'
rest = require 'grouper-rest'
test_helpers = require '../lib/test_helpers'
fixtures = require '../resources/fixtures'


server = null
test_helpers.setup (err, conf) ->
  if err then throw err
  rest.start conf, (up, s) ->
    if up then throw up
    server = s
    test_helpers.update exports, tests


tests =
  'test GET doc': (beforeExit) ->
    req = {method: 'GET', url: '/docs/will/mid/doc3'}
    check = (res) ->
      doc = (JSON.parse res.body)
      assert.eql doc.id, "doc3"
      assert.eql doc.text, fixtures.documents["will/mid/doc3"].main.text
    assert.response server, req, {status: 200}, check

  'test GET one cluster': (beforeExit) ->
    req = {method: 'GET', url: '/clusters/will/mid/macbeth'}
    expected = ["doc3", "doc4", "doc5"]
    check = (res) ->
      actual = (JSON.parse res.body).sort()
      assert.eql actual, expected
    assert.response server, req, {status: 200}, check

  'test GET all clusters A': ->
    req = {method: 'GET', url: '/clusters/will/mid'}
    check = (res) ->
      assert.response server, req, {status: 200}
      all = JSON.parse res.body
      assert.ok ("macbeth" of all)
      assert.ok ("caesar" of all)
      assert.ok ("general" of all)
      assert.eql all["macbeth"].length, 3
      assert.eql all["caesar"].length, 2
      assert.eql all["general"].length, 2
    assert.response server, req, check

  'test GET all clusters B': ->
    req = {method: 'GET', url: '/clusters/will/tail'}
    check = (res) ->
      assert.response server, req, {status: 200}
      all = JSON.parse res.body
      assert.ok ("macbeth" in all)

  'test GET single cluster not found': ->
    req = {method: 'GET', url: '/clusters/will/mid/avenue-q'}
    assert.response server, req, {status: 404}
    req = {method: 'GET', url: '/clusters/will/no-such-coll/macbeth'}
    assert.response server, req, {status: 404}

  'test GET clusters for collection not found': ->
    req = {method: 'GET', url: '/clusters/will/no-such-coll'}
    assert.response server, req, {status: 404}

  'test POST doc': ->
    req =
      method: 'POST'
      url: '/collections/will/lear'
      data: JSON.stringify {id: '10', text: 'Have more than thou showest'}
    assert.response server, req, {body: "/docs/will/lear/10"}
    req =
      method: 'POST'
      url: '/collections/will/lear'
      data: JSON.stringify {id: '11', text: 'Speak less than thou knowest'}
    assert.response server, req, {body: "/docs/will/lear/11"}

  'test POST doc to invalid collections': ->
    req =
      method: 'POST'
      url: '/collections//my-collection'
      data: JSON.stringify {id: '11', text: 'Speak less than thou knowest'}
    assert.response server, req, {status: 404}
    req =
      method: 'POST'
      url: '/collections/will/'
      data: JSON.stringify {id: '11', text: 'Speak less than thou knowest'}
    assert.response server, req, {status: 404}

exports = module.exports = {}
