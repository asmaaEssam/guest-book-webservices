const { StringDecoder } = require("string_decoder");
const ObjectID = require("mongodb").ObjectID;

const isAuthenticated = require("../helpers/authentication").isAuthenticated;

//Getting All Messages ==>> "/messages"
function getMsg(req, res, db) {
  if (req.method === "GET") {
    //check authentication
    const token = req.headers["token"];
    const _id = isAuthenticated(token);
    if (!_id) {
      res.writeHead(404);
      res.end("user is not authenticated");
    } else {
      db.collection("messages")
        .find()
        .toArray(function (err, result) {
          if (err) throw err;
          const messages = JSON.stringify(result);
          res.writeHead(200, "ok", { "content-type": "application/json" });
          console.log(messages);
          res.end(messages);
        });
    }
  } else {
    res.writeHead(404);
    res.end("Request Method is not valid");
  }
}

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
            console.log(buffer);
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

//Editing Message API ==>> "/message/edit/:id"
function editMsg(req, res, db) {
  if (req.method === "POST" || req.method === "PATCH") {
    //TODO change it in production and deployment

    const myURL = new URL("http://localhost:9000" + req.url);
    const msgId = myURL.searchParams.get("id");
    //check authentication
    const token = req.headers["token"];
    const userId = isAuthenticated(token);

    if (!userId) {
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
        const msgUpdated = JSON.parse(buffer);

        const msg = await db
          .collection("messages")
          .findOne({ _id: new ObjectID(msgId) });

        if (msg) {
          if (msg.userId !== userId) {
            res.writeHead(404);
            res.end("User is not authenticated");
          } else {
            if (!msgUpdated.body) {
              res.writeHead(404);
              res.end("Message body is required");
            } else {
              try {
                await db
                  .collection("messages")
                  .findOneAndUpdate(
                    { _id: new ObjectID(msgId) },
                    { $set: { body: msgUpdated.body } }
                  );

                console.log("1 document updated");
                res.writeHead(200, "ok", {
                  "content-type": "application/json",
                });
                res.end(buffer);
              } catch (err) {
                throw new Error(err);
              }
            }
          }
        } else {
          res.writeHead(404);
          res.end("Message Not Found");
        }
      });
    }
  } else {
    res.writeHead(404);
    res.end("Request Method is not valid");
  }
}

//Deleting Message API == >> "/message/delete/:id"
async function deleteMsg(req, res, db) {
  if (req.method === "DELETE") {
    //TODO change it in production and deployment

    const myURL = new URL("http://localhost:9000" + req.url);
    const msgId = myURL.searchParams.get("id");

    if (msgId === null || msgId.length !== 24) {
      res.writeHead(404);
      res.end("Message Not Found");
    } else {
      //check authentication
      const token = req.headers["token"];
      const userId = isAuthenticated(token);

      if (!userId) {
        res.writeHead(404);
        res.end("user is not authenticated");
      } else {
        const msg = await db
          .collection("messages")
          .findOne({ _id: new ObjectID(msgId) });
        if (msg) {
          if (msg.userId !== userId) {
            res.writeHead(404);
            res.end("User is not authenticated");
          } else {
            try {
              await db
                .collection("messages")
                .findOneAndDelete({ _id: new ObjectID(msgId) });

              console.log("1 document Deleted");
              res.writeHead(200, "ok", {
                "content-type": "application/json",
              });
              res.end("Message Deleted Successfully");
            } catch (err) {
              throw new Error(err);
            }
          }
        } else {
          res.writeHead(404);
          res.end("Message Not Found");
        }
      }
    }
  } else {
    res.writeHead(404);
    res.end("Request Method is not valid");
  }
}

//Replying on Message API == >> "/message/reply/:id"
async function msgReply(req, res, db) {
  if (req.method === "POST" || req.method === "PATCH") {
    //TODO change it in production and deployment

    const myURL = new URL("http://localhost:9000" + req.url);
    const msgId = myURL.searchParams.get("id");
    //check authentication
    const token = req.headers["token"];
    const userId = isAuthenticated(token);
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectID(userId) });

    if (!user) {
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
        const msgUpdated = JSON.parse(buffer);

        const msg = await db
          .collection("messages")
          .findOne({ _id: new ObjectID(msgId) });

        if (msg) {
          if (!msgUpdated.reply.body) {
            res.writeHead(404);
            res.end("Reply body is required");
          } else {
            try {
              await db.collection("messages").findOneAndUpdate(
                { _id: new ObjectID(msgId) },
                {
                  $set: {
                    replies: {
                      userId: new ObjectID(userId),
                      reply: msgUpdated.reply.body,
                    },
                  },
                }
              );

              console.log("1 reply is added");
              res.writeHead(200, "ok", {
                "content-type": "application/json",
              });
              res.end(buffer);
            } catch (err) {
              throw new Error(err);
            }
          }
        } else {
          res.writeHead(404);
          res.end("Message Not Found");
        }
      });
    }
  } else {
    res.writeHead(404);
    res.end("Request Method is not valid");
  }
}

module.exports = {
  getMsg,
  postMsg,
  editMsg,
  deleteMsg,
  msgReply,
};
