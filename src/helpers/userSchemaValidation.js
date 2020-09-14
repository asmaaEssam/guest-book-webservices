function emailIsValid(email) {
    return /\S+@\S+\.\S+/.test(email);
  }
  
  function userRegisterValidation(newUser, db) {
    if (newUser.email && newUser.fullName && newUser.password) {
      if (!emailIsValid(newUser.email)) {
        return "unvalid Email";
      }
      if (newUser.password.length < 6) {
        return "unvalid Password";
      }
      return "";
    }
    return "unvalid Schema";
  }
  
  module.exports = {
      userRegisterValidation
  };