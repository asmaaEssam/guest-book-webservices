const MongoClient = require("mongodb").MongoClient;
const http = require("http");

const onRequest = require("./server").onRequest;

//URL of Atlas cloud database
const url =
  process.env.HostURL ||
  "mongodb+srv://asma:Asmaa@312411@cluster0.riifl.mongodb.net/GuestBookDB?retryWrites=true&w=majority";
const port = process.env.PORT || 9000;
MongoClient.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, db) => {
    if (err) {
      console.log(err);
      process.exit();
    }
    const dbo = db.db("GuestBookDB");

    const server = http.createServer((req, res) => {
      const headers = {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods":
          "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Expose-Headers": "*",
        "Access-Control-Max-Age": 2592000, // 30 days
        "content-type": "application/json",
        Connection: "keep-alive",
      };
      if (req.method === "OPTIONS") {
        res.writeHead(204, headers);
        res.end();
        return;
      }
      onRequest(req, res, dbo, headers);
    });
    server.listen(port, () => {
      console.log(`Server running at port ${port}`);
    });
  }
);
