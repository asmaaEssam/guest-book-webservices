const { StringDecoder } = require("string_decoder");

const isAuthenticated = require("../helpers/authentication").isAuthenticated;


//Posting Message API  ==>> "/message/add"
function postMsg(req, res, db) {
    if (req.method === "POST") {
      //check authentication
      const token = req.headers["token"];
      const _id = isAuthenticated(token);
      if (!_id) {
        res.writeHead(404);
        res.end("user is not authenticated");
      } else {
        let decorder = new StringDecoder("utf-8");
        let buffer = "";
  
        req.on("data", (chunck) => {
          buffer += decorder.write(chunck);
        });
  
        req.on("end", async () => {
          buffer += decorder.end();
          const newMsg = JSON.parse(buffer);
          if (!newMsg.body) {
            res.writeHead(404);
            res.end("Message body is required");
          } else {
            newMsg.userId = _id;
            try {
              await db.collection("messages").insertOne(newMsg);
              console.log("1 document inserted");
              res.writeHead(200, "ok", { "content-type": "application/json" });
              console.log(buffer)
              res.end(buffer);
            } catch (err) {
              throw new Error(err);
            }
          }
        });
      }
    } else {
      res.writeHead(404);
      res.end("Request Method is not valid");
    }
  }