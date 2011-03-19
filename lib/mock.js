var connect = require('connect')
  , quip = require('quip')


function _str() {
  var args = Array.prototype.slice.call(arguments, 0)
  args.push("")
  return args.join("'")
}


function postDoc (req, res) {
  var data = []
    , ns = req.params.ns
    , key = req.params.collectionKey
  if (ns == "protected-namespace") {
    res.forbidden().json({error: _str('Cannot post to namespace', ns)})
  }
  req.on('data', function (chunk) { data.push(chunk.toString('utf8')) })
  req.on('end', function () {
    var doc
    try { doc = JSON.parse(data.join('')) }
    catch(e) { res.badRequest().json({error: 'Cannot parse JSON request.'}) }
    documents[doc.id] = doc.text
    res.created().json("/docs/" + ns + "/" + key + "/" + doc.id)
  })
}


function getSingleCluster (req, res) {
  var ns = req.params.ns
    , key = req.params.collectionKey
    , label = req.params.label

  if (key == "no-such-key") {
    res.notFound().json({error: _str('unknown collection: ', key)})
    return
  }
  if (label == "no-such-label") {
    res.notFound().json({error: _str('unknown cluster: ', key, '/', label)})
    return
  }
  res.ok().json(clusters[label])
}


function getClusters (req, res) {
  var ns = req.params.ns
    , key = req.params.collectionKey

  if (key == "no-such-key") {
    res.notFound().json({error: _str('unknown collection: ', key)})
    return
  }
  res.ok().json(clusters)
}


function getDoc (req, res) {
  var id = req.params.docId
  if (id in documents) {
    res.ok().json({"id": id, "text": documents[id]})
    return
  }
  res.notFound().json({error: _str('unknown document id', id)})
}


exports.server = connect.createServer(
    connect.favicon()
  , quip()
  , connect.router(function(app) {
      app.post('/collections/:ns/:collectionKey', postDoc)
      app.get('/clusters/:ns/:collectionKey/:label', getSingleCluster)
      app.get('/clusters/:ns/:collectionKey', getClusters)

      // mainly for inspection / debugging
      app.get('/docs/:ns/:collectionKey/:docId', getDoc)
    })
)


var documents = {
  "1497376": "Awesome with flash content. Incredibly fast "
           + "speeds. Great picture quality. Definetely a "
           + "must have web browser."
, "1497339": "Well its just awesome! love the modern look!"
, "1497203": "paste and search !!! awesome"
, "1496049": "Not requiring registration to submit feedback = awesome;"
, "1364806": "I like the speed of the connection, and new style of homepage"
, "1350865": "it's nice browser. new version was amazing"
, "1395249": "it's new and cool"
, "1395227": "yeay it's new"
, "1480689": "быстрота и у удобность пользование"
, "1479325": "Мне очень понравился новый интерфейс. Он выполнен просто "
           + "замечательно! Еще я думал, что бете сайты будут открываться "
           + "быстрее,и это правда!"
, "1462655": "Скорость, интерфейс =)"
, "1396188": "здорово красивый интерфейс и шустрый "
           + "единственное не идут некоторые расширения для "
           + "браузера"
}

var clusters = {
  "awesome": ["1497376", "1497339", "1497203", "1496049"]
, "new and cool": ["1364806", "1350865", "1395249", "1395227"]
, "Быстрее и лучше!": ["1480689", "1479325", "1462655", "1396188"]
}
