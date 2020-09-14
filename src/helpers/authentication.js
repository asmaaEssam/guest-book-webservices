const jwt = require('jsonwebtoken');

function isAuthenticated (token){
    let userID;
    jwt.verify(token, process.env.SECRETKEY || "sjndsj" , function(err, decoded) {
        if (err) return false 
        userID = decoded._id;
      });
      return userID;
}
module.exports = {
    isAuthenticated
}