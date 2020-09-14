const { StringDecoder } = require("string_decoder");
const crypto = require("crypto");


const userRegisterValidation = require("../helpers/userSchemaValidation")
  .userRegisterValidation;

const secret = process.env.SECRET || "sdjjio";

//Register API  ==>> "/user/register"
function register(req, res, db) {
  if (req.method === "POST") {
    //decoding for the data sent in request body
    let decorder = new StringDecoder("utf-8");
    let buffer = "";
    req.on("data", (chunck) => {
      buffer += decorder.write(chunck);
    });
    req.on("end", async () => {
      buffer += decorder.end();
      const newUser = JSON.parse(buffer);
      let validationMsg = userRegisterValidation(newUser, db);

      //Check if email is exist
      const user = await db
        .collection("users")
        .findOne({ email: newUser.email });
      if (user && validationMsg === "")
        validationMsg = "email is already exist";

      if (!validationMsg) {
        try {
          //making password hashed for security
          newUser.password = crypto
            .createHmac("sha256", secret)
            .update(newUser.password)
            .digest("hex");

          await db.collection("users").insertOne(newUser);
          console.log("1 document inserted");
          res.writeHead(200, "ok", { "content-type": "application/json" });
          res.end(buffer);
        } catch (err) {
          throw new Error(err);
        }
      } else {
        res.writeHead(404, { "content-type": "application/json" });
        res.end(`{"error" : ${validationMsg}}`);
      }
    });
  } else {
    res.writeHead(404);
    res.end("Request Method is not valid");
  }
}

module.exports = {
    register
  };