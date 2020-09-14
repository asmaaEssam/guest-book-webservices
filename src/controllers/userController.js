const { StringDecoder } = require("string_decoder");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const userRegisterValidation = require("../helpers/userSchemaValidation")
  .userRegisterValidation;
  
const secret = process.env.SECRET || "sdjjio";

//Register API  ==>> "/user/register"
function register(req, res, db,headers) {

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
          res.writeHead(200, "ok",headers);
          res.end(buffer);
        } catch (err) {
          throw new Error(err);
        }
      } else {
        res.writeHead(404, headers);
        res.end(`{"error" : ${validationMsg}}`);
      }
    });
  } else {
    res.writeHead(404,headers);
    res.end("Request Method is not valid");
  }
}

//Login API ==>> "/user/login"
function login(req, res, db,headers) {
    console.log("Enter Login Function")
    if (req.method === "POST") {
      //decoding for the data sent in request body
      let decorder = new StringDecoder("utf-8");
      let buffer = "";
  
      req.on("data", (chunck) => {
        buffer += decorder.write(chunck);
      });
  
      req.on("end", async () => {
        buffer += decorder.end();
        let validationMsg = "";
        let { email, password } = JSON.parse(buffer);
        try {
          const user = await db.collection("users").findOne({ email });
          if (user) {
            //hashing the password to compare it with the password in database
  
            password = crypto
              .createHmac("sha256", secret)
              .update(password)
              .digest("hex");
  
            //check if passwords matches
  
            if (user.password !== password) {
              validationMsg = "password is wrong";
              res.writeHead(404, headers);
              res.end(`{"error" : ${validationMsg}}`);
            }
  
            //sending back a token for authorization
  
            const token = jwt.sign(
              { _id: user._id },
              process.env.SECRETKEY || "sjndsj",
              { expiresIn: 60 * 60 }
            );
            res.writeHead(200, "ok",{...headers, "token":token})
            console.log("Finishing")
            res.end(`{"token":${token}}`);
            console.log("end request")
          } else {
            validationMsg = "email doesn't exist";
            res.writeHead(404, headers);
            res.end(`{"error" : ${validationMsg}}`);
          }
        } catch (err) {
          throw new Error(err);
        }
      });
    } else {
      res.writeHead(404,headers);
      res.end("Resource not found");
    }
  }

module.exports = {
    register,
    login
  };