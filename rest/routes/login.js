// 必要なパッケージの読み込み
var mysql = require('mysql')
var express = require('express');


function sql_error(sql_message, resource, code) {
  return {
    "message": "Error executing MySQL query: " + sql_message,
    "error": {
      "resource": resource,
      "code": code
    }
  };
}

function unknown_user_error(username, resource) {
  return {
    "message": "Error unknown username: " + username,
    "error": {
      "resource": resource,
      "code": "404"
    }
  };
}

module.exports = function(connection) {
  var router = express.Router();

  router.post('/', function(req, res, next) {
    if(req.body.userName) {
      req.session.user = {name: req.body.userName};
      res.redirect('../');
    } else {
      var err = '入力が正しくありません。確認して再入力してください。';
      res.render('login', {error: err});
    }
  });

  return router
};
