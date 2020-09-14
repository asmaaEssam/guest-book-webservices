const url = require("url");
const routes = require('./src/routes/routes')

function onRequest(req, res, db,headers) {

  const urlRoutes = routes.routes;
  const pathname = url.parse(req.url).pathname;

  urlRoutes[pathname](req,res,db,headers)
}
module.exports = {
    onRequest
}