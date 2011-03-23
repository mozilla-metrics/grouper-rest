keys = require 'query/reverse_parts_keys'
query = require 'query/query'
assert = require 'assert'


NS = 'myNs'
CK = 'myCk'

module.exports =

  'it makes document keys': ->
    assert.eql (keys.doc (query.forDocument NS, CK, '12345')), 'myNs/myCk/54321'
    assert.eql (keys.doc (query.forDocument NS, CK, 'abc')), 'myNs/myCk/cba'

  'it makes cluster keys': ->
    q = query.forCluster NS, CK, 'fusswuss', '62385619'
    assert.eql (keys.cluster q), 'DEFAULT/myNs/myCk/91658326/fusswuss'
    q = query.forCluster NS, CK, 'myLabel', '9999955555'
    assert.eql (keys.cluster q), 'DEFAULT/myNs/myCk/5555599999/myLabel'

  'it makes all-clusters glob keys': ->
    q = query.forAllClusters NS, CK, '62385619'
    assert.eql (keys.allClusters q), 'DEFAULT/myNs/myCk/91658326/*'
    q = query.forAllClusters NS, CK, '9999955555'
    assert.eql (keys.allClusters q), 'DEFAULT/myNs/myCk/5555599999/*'
