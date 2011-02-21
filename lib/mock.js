var connect = require('connect')
  , quip = require('quip')
  , dispatch = require('dispatch')

var documents = { 1497376: "Awesome with flash content. Incredibly fast "
                         + "speeds. Great picture quality. Definetely a "
                         + "must have web browser."
                , 1497339: "Well its just awesome! love the modern look!"
                , 1497203: "paste and search !!! awesome"
                , 1496049: "Not requiring registration to submit feedback = "
                         + "awesome;"
                , 1364806: "I like the speed of the connection, and its new "
                         + "style of homepage"
                , 1350865: "it's nice browser. new version was amazing"
                , 1395249: "it's new and cool"
                , 1395227: "yeay it's new"
                , 1480689: "быстрота и у удобность пользование"
                , 1479325: "Мне очень понравился новый интерфейс. Он "
                         + "выполнен просто замечательно! Еще я думал, что "
                         + "в бете сайты будут открываться быстрее,и это "
                         + "правда!"
                , 1462655: "Скорость, интерфейс =)"
                , 1396188: "здорово красивый интерфейс и шустрый "
                         + "единственное не идут некоторые расширения для "
                         + "браузера"
                }

var clusters = { "awesome": [1497376, 1497339, 1497203, 1496049]
               , "new and cool": [1364806, 1350865, 1395249, 1395227]
               , "Быстрее и лучше!": [1480689, 1479325, 1462655, 1396188]
               }

var collectionKeys = {"existing-key": clusters}

function postDoc (req, res, key) {
  var data = []
  req.on('data', function (chunk) { data.push(chunk.toString('utf8')) })
  req.on('end', function () {
    var doc;
    try { doc = JSON.parse(data.join('')) }
    catch(e) { res.badRequest().json({error: 'I cannot understand this.'}) }
    documents[doc.id] = doc.text
    collectionKeys[key] = clusters
    res.created().json("/document/" + doc.id)
  })
}

function getDoc (req, res, id) {
  if (id in documents) res.ok().json({"id": id, "text": documents[id]})
  else res.notFound().json({error: 'no such doc'})
}

function getClusters (req, res, key) {
  if (key in collectionKeys) {
    res.ok().json(clusters)
    return
  }  
  res.notFound().json({error: 'no such collection'})
}

function getCluster (req, res, id) {
  if (id in clusters) res.ok().json(clusters[id])
  res.notFound({error: 'no such cluster'})
}

// quip forgets to specify encoding
function decorate(req, res, next) {
  res.json = function(data) { 
    res.headers({'Content-Type': 'application/json; charset=utf-8'});
    return data ? res.send(data, "utf8") : res
  }
  res.send = function(data) {
    if(res._headers['Content-Type'].indexOf('application/json') == 0) {
      if(typeof data == 'object') data = JSON.stringify(data);
    }
    res.writeHead(res._status, res._headers);
    if (data) res.write(data, "utf8");
    res.end();
    return null;
  };
  next()
}

exports.server = connect
  .createServer(
    quip()
  , dispatch({ '/collections/(.*)': postDoc
             , '/document/(.*)': getDoc
             , '/clusters/(.*)': getClusters
             , '/cluster/(.*)': getCluster
             })
  )
