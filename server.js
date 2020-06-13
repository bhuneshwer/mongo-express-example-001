const app = require('express')();
const http = require('http').Server(app);

function getDbClient() {
    return new Promise((resolve, reject) => {
        var dbUrl = "mongodb://localhost:27017/mongo-example-001"
        require("mongodb").MongoClient.connect(dbUrl, {
            "useNewUrlParser": true,
            "useUnifiedTopology": true
        }).then(function(client) {
            console.warn("client", client)
            resolve(client.db());
        }).catch(function(err) {
            reject(err);
        });
    });
}

app.get("/:username", (req, res) => {
    var username = req.params.username;
    getDbClient().then((client) => {
        var collection = client.collection('collection1');
        var cursor = collection.find({name:username});
        cursor.toArray((err, results) => {
            if (!err) {
                res.json({ "results": results,"username":username })
            } else {
                res.send({ "results": null })
            }
        });

    }, (err) => {
        res.send({ "results": err.toString() })
    })
})

function startServer() {
    http.listen(3001, function() {
        console.log('listening on *:', 3001);
    });
}
startServer()