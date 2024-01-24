var express = require("express"); // Requires the Express module
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
var http = require("http");
const cors = require("cors");
var path = require("path");
var fs = require("fs");

// Calls the express function to start a new Express application
var app = express();
app.use(cors());
app.use(express.json());
http.createServer(app);

const uri =
  "mongodb+srv://crusader:OmegaLevel@cst3145.ehobo2w.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

/**This is the middleware logger*/
app.use(function (request, response) {
  // middleware logger
  console.log("In comes a request to: " + request.url);
  // response.end("Hello, world!");
});

/** Connect to the database during the application startup */
async function start() {
  try {
    await client.connect();
    console.log("Connected to the database");

    db = client.db("CST3145");
    // Start listening for incoming requests only after connecting to the database
    const port = process.env.PORT || 3000;
    app.listen(port, function () {
      console.log("App started on port: " + port);
    });
  } catch (err) {
    console.error(err);
    // Handle connection error
  }
}
// Call the start function to connect to the database and start the server
start();

/**This is the endpoint to verify if the image exists or not */
app.get("/images/:imageName", async function (req, res, next) {
  var filePath = path.join(__dirname, "static", req.url);
  console.log(filePath);
  fs.stat(filePath, function (err, fileInfo) {
    if (err) {
      next();
      return;
    }
    if (fileInfo.isFile()) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });
});
app.use(function (req, res) {
  res.status(404);
  res.send("Image not found!");
});

//This is to get the list of all the values in the collection
app.get("/collections/:collectionName", async function (req, res, next) {
  try {
    await client.connect();
    const results = await req.collection.find({}).toArray();
    res.send(results);
    // res.end(results);
  } catch (err) {
    return next(err);
  }
});

app.get("/search/collections/:collectionName", async function (req, res) {
  try {
    // await cli
  } catch (ex) {}
});

app.param("collectionName", function (req, res, next, collectionName) {
  req.collection = db.collection(collectionName);
  return next();
});

// Express route for handling POST requests to insert into the collection
app.post("/collections/:collectionName", async function (req, res, next) {
  try {
    const result = await req.collection.insertOne(req.body);
    res.send(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// This is to update an item of the collection
app.put("/collections/:collectionName/:id", async function (req, res, next) {
  try {
    const result = await req.collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body },
      { safe: true, multi: false }
    );

    if (result.matchedCount === 1) {
      res.send({ msg: "success" });
    } else {
      res.send({ msg: "error" });
    }
  } catch (err) {
    next(err);
  }
});
