assert = require 'assert'
server = (require '../lib/mock').server

module.exports =
  'test GET doc': ->
    req = {method: 'GET', url: '/document/1497203'}
    expected = {id: "1497203", text: "paste and search !!! awesome"}
    check = (res) -> assert.eql (JSON.parse res.body), expected
    assert.response server, req, check
    
    req = {method: 'GET', url: '/document/not-a-number'}
    assert.response server, req, {status: 404}

  'test GET cluster': ->
      req = {method: 'GET', url: '/cluster/awesome'}
      expected = [1497376, 1497339, 1497203, 1496049]
      check = (res) -> assert.eql (JSON.parse res.body), expected
      assert.response server, req, check

  'test GET clusters': ->
      req = {method: 'GET', url: '/clusters/existing-key'}
      check = (res) -> 
        assert.eql res.status, 200
        assert.eql res.body.length, 147
      assert.response server, req, check

  'test POST doc': ->
    req = 
      method: 'POST'
      url: '/collections/my-collection'
      data: JSON.stringify {id: "4711", text: "My NSHO"}
    assert.response server, req, {body: "/documents/4711"}
