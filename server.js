const app = require('express')();
const http = require('http').Server(app);
// Body porser helps us to convert our request data in the required format. Here we have use json as the format.
var bodyParser = require('body-parser');
const DB_URL = "mongodb+srv://testuser:9XfaJ5mZhGTrKHRI@cluster0-cvdjl.mongodb.net/students-db?retryWrites=true&w=majority"
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(require('express').static('client'))
// parse application/json
app.use(bodyParser.json())


function getDbClient() {
    return new Promise((resolve, reject) => {
        //var dbUrl = "mongodb://localhost:27017/mongo-example-001"
        require("mongodb").MongoClient.connect(DB_URL, {
            "useNewUrlParser": true,
            "useUnifiedTopology": true
        }).then(function (client) {
            resolve(client.db());
        }).catch(function (err) {
            reject(err);
        });
    });
}

app.get("/", function (req, res){
    res.render("index.html")
})

// Inserting data into database

app.post("/student", function (req, res) {
    var rqstBody = req.body;
    if (rqstBody && rqstBody.rollNo && req.body.name) {
        getDbClient().then((client) => {
            var collection = client.collection('students');
            var dataToInsert = {
                "name": rqstBody.name,
                "rollNo": rqstBody.rollNo,
                "course": rqstBody.course
            };

            collection.findOne({
                rollNo: rqstBody.rollNo
            }, (err, sdata) => {
                if (!err && sdata && sdata.rollNo) {
                    res.send("Roll No. is already exist")
                } else {
                    collection.insert(dataToInsert, (err, dataToInsert) => {
                        if (!err) {
                            res.send(dataToInsert)
                        } else {
                            res.send(err.toString())
                        }
                    })
                }
            })

        }, (err) => {
            res.send("Err while connecting to db err is ", err.toString())
        })
    } else {
        res.send("Roll No and Name is mandatory field")
    }
})


// Update Student

app.put("/updatestudent", function (req, res) {
    var rqstBody = req.body;
    var sudentRollNo = req.query.rollNo;
    if (rqstBody.dataToUpdate && sudentRollNo) {
        getDbClient().then((client) => {
            var collection = client.collection('students');

            collection.findOne({
                rollNo: parseInt(sudentRollNo)
            }, (err, sdata) => {
                if (!err && sdata && sdata.rollNo) {
                    delete rqstBody.dataToUpdate["rollNo"];
                    collection.update({
                        _id: sdata._id
                    }, {
                        "$set": rqstBody.dataToUpdate
                    }, (err, response) => {
                        if (!err && response) {
                            res.send(response);
                        }
                    })
                } else {
                    res.send("Given rollno is an invalid number")
                }
            })

        }, (err) => {
            res.send("Err while connecting to db err is ", err.toString())
        })
    } else {
        res.send("Roll No and Name is mandatory field")
    }
})


// Query Parameters example
app.get("/list", (req, res) => {
    console.log(req.query)
    // Trying to read data through  query param
    var rollNo = req.query.rollNo;
    var name = req.query.studentName;
    getDbClient().then((client) => {
        var collection = client.collection('students');
        var query = {};

        // checking if input is number and converting it to int
        if (rollNo && !isNaN(rollNo)) {
            rollNo = parseInt(rollNo)
            query.rollNo = rollNo;
        }
        if (name && name.length) {
            query.name = name
        }

        cursor = collection.find(query);

        cursor.toArray((err, results) => {
            if (!err) {
                res.json({
                    "results": results
                })
            } else {
                res.send({
                    "results": null
                })
            }
        });

    }, (err) => {
        res.send({
            "results": err.toString()
        })
    })
})


app.delete("/deleteStudent/:rollNo", (req, res) => {
    var rollNo = req.params.rollNo;
    getDbClient().then((client) => {
        var collection = client.collection('students');
        collection.remove({"rollNo":parseInt(rollNo)},(err,deleteResponse)=>{
            if(!err && deleteResponse){
                res.send(deleteResponse)
            }
        })

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
    http.listen(3001, function () {
        console.log('listening on *:', 3001);
    });
}
startServer()