const MongoClient = require("mongodb").MongoClient;
const http = require("http");


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
        console.log(dbo);
      });
    

    server.listen(port, () => {
      console.log(`Server running at port ${port}`);
    });
  }
);