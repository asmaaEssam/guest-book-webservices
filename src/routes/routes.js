var userController = require('../controllers/userController');
var messageController = require('../controllers/messageController');

var routes = {};
routes["/user/register"] = userController.register;
routes["/user/login"] = userController.login;
routes["/messages"] = messageController.getMsg;
routes["/message/add"] = messageController.postMsg;
routes["/message/edit/"] = messageController.editMsg;
routes["/message/delete/"] = messageController.deleteMsg;
routes["/message/reply"] = messageController.msgReply;

exports.routes = routes;