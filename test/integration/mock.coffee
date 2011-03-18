assert = require 'assert'
server = (require 'mock').server

doc = JSON.stringify {id: "4711", text: "My NSHO"}

module.exports =
  'test GET doc': ->
    req = {method: 'GET', url: '/docs/test-ns/test-coll/1497203'}
    expected = {id: "1497203", text: "paste and search !!! awesome"}
    check = (res) -> assert.eql (JSON.parse res.body), expected
    assert.response server, req, check
    req = {method: 'GET', url: '/docs/test-ns/no-such-doc'}
    assert.response server, req, {status: 404}

  'test GET single cluster': ->
    req = {method: 'GET', url: '/clusters/test-ns/my-key/awesome'}
    expected = ["1497376", "1497339", "1497203", "1496049"]
    check = (res) -> assert.eql (JSON.parse res.body), expected
    assert.response server, req, check

  'test GET single cluster not found': ->
    req = {method: 'GET', url: '/clusters/test-ns/no-such-key/awesome'}
    assert.response server, req, {status: 404}
    req = {method: 'GET', url: '/clusters/test-ns/my-key/no-such-label'}
    assert.response server, req, {status: 404}

  'test GET clusters for collection': ->
    req = {method: 'GET', url: '/clusters/test-ns/my-key'}
    check = (res) ->
      assert.response server, req, {status: 200}
      assert.length res.body, 171
    assert.response server, req, check

  'test GET clusters for collection not found': ->
    req = {method: 'GET', url: '/clusters/some-ns/no-such-key'}
    assert.response server, req, {status: 404}

  'test POST doc': ->
    req =
      method: 'POST'
      url: '/collections/test-ns/my-collection'
      data: doc
    assert.response server, req, {body: "/docs/test-ns/4711"}

  'test POST doc forbidden': ->
    req =
      method: 'POST'
      url: '/collections/protected-namespace/my-collection'
      data: doc
    assert.response server, req, {status: 403}
