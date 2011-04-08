assert = require 'assert'

keys = require 'storage/keys/reverse_parts_keys'
model = require 'model'


COL_REF = new model.CollectionRef 'myNS', 'myCK'

DOCREF_A = new model.DocumentRef COL_REF, '12345'
DOCREF_B = new model.DocumentRef COL_REF, 'abc'

ALLREF_A = new model.ClusterRef COL_REF, '62385619', null
ALLREF_B = new model.ClusterRef COL_REF, '9999955555', null

CLUREF_A = new model.ClusterRef COL_REF, '62385619', 'fusswuss'
CLUREF_B = new model.ClusterRef COL_REF, '999955555', 'myLabel'


module.exports =

  'it makes document keys': ->
    assert.eql (keys.document DOCREF_A), 'myNS/myCK/54321'
    assert.eql (keys.document DOCREF_B), 'myNS/myCK/cba'

  'it makes cluster keys': ->
    assert.eql (keys.cluster CLUREF_A), 'DEFAULT/myNS/myCK/91658326/fusswuss'
    assert.eql (keys.cluster CLUREF_B), 'DEFAULT/myNS/myCK/555559999/myLabel'

  'it makes all-clusters scanner keys': ->
    assert.eql (keys.allClusters CLUREF_A), 'DEFAULT/myNS/myCK/91658326/'
    assert.eql (keys.allClusters CLUREF_B), 'DEFAULT/myNS/myCK/555559999/'
