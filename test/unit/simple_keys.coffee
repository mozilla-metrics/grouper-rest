keys = require 'query/simple_keys'
query = require 'query/query'
assert = require 'assert'


NS = 'myNs'
CK = 'myCk'

module.exports =

  'it makes document keys': ->
    assert.eql (keys.doc (query.forDocument NS, CK, '12345')), 'myNs/myCk/12345'
    assert.eql (keys.doc (query.forDocument NS, CK, 'abc')), 'myNs/myCk/abc'

  'it makes cluster keys': ->
    q = query.forCluster NS, CK, 'fusswuss', '62385619'
    assert.eql (keys.cluster q), 'DEFAULT/myNs/myCk/62385619/fusswuss'
    q = query.forCluster NS, CK, 'myLabel', '9999955555'
    assert.eql (keys.cluster q), 'DEFAULT/myNs/myCk/9999955555/myLabel'

  'it makes all-clusters glob keys': ->
    q = query.forAllClusters NS, CK, '62385619'
    assert.eql (keys.allClusters q), 'DEFAULT/myNs/myCk/62385619/*'
    q = query.forAllClusters NS, CK, '9999955555'
    assert.eql (keys.allClusters q), 'DEFAULT/myNs/myCk/9999955555/*'
