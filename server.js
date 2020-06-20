const app = require('express')();
const http = require('http').Server(app);
var bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

function getDbClient() {
    return new Promise((resolve, reject) => {
        var dbUrl = "mongodb://localhost:27017/mongo-example-001"
        require("mongodb").MongoClient.connect(dbUrl, {
            "useNewUrlParser": true,
            "useUnifiedTopology": true
        }).then(function(client) {
            resolve(client.db());
        }).catch(function(err) {
            reject(err);
        });
    });
}

// Inserting data into database

app.post("/student",function(req,res){
    var rqstBody = req.body;
    if(rqstBody && rqstBody.rollNo && req.body.name){
        getDbClient().then((client) => {
            var collection = client.collection('collection1');
            var dataToInsert = {
                "name":rqstBody.name,
                "rollNo":rqstBody.rollNo
            };
            collection.insert(dataToInsert,(err,dataToInsert) => {
                if(!err){
                    res.send(dataToInsert)
                }else{
                    res.send(err.toString())
                }
            })    
        }, (err) => {
            res.send("Err while connecting to db err is ",err.toString())
        })
    }else{
        res.send("Roll No and Name is mandatory field")
    }
})

// Query Parameters example
app.get("/", (req, res) => {
    console.log( req.query)
    // Trying to read data through  query param
    var rollNo = req.query.rollNo;
    var name = req.query.studentName;
    getDbClient().then((client) => {
        var collection = client.collection('collection1');
        var query = {};

        // checking if input is number and converting it to int
        if(rollNo && !isNaN(rollNo)){
            rollNo = parseInt(rollNo)
            query.rollNo = rollNo;
        }
        if(name && name.length){
            query.name = name
        }
        
        cursor = collection.find(query);

        cursor.toArray((err, results) => {
            if (!err) {
                res.json({ "results": results})
            } else {
                res.send({ "results": null })
            }
        });

    }, (err) => {
        res.send({ "results": err.toString() })
    })
})



// RouteParam example
    
// app.get("/:rollNo", (req, res) => {
//     var rollNo = req.params.rollNo;
//     getDbClient().then((client) => {
//         var collection = client.collection('collection1');
//         var cursor = collection.find({"rollNo":parseInt(rollNo)});
//         cursor.toArray((err, results) => {
//             if (!err) {
//                 res.json({ "results": results })
//             } else {
//                 res.send({ "results": null })
//             }
//         });

//     }, (err) => {
//         res.send({ "results": err.toString() })
//     })
// })

function startServer() {
    http.listen(3001, function() {
        console.log('listening on *:', 3001);
    });
}
startServer()