// 必要なパッケージの読み込み
let express = require('express');
let UserDB = require('../model/userdb');
let BoardDB = require('../model/boarddb');

module.exports = function (connection) {
  const router = express.Router();
  const userDB = new UserDB(connection);
  const boardDB = new BoardDB(connection);

  // ユーザー一覧の取得
  router.get('/users', function (req, res, next) {
    userDB.findAll(function (err, users) {
      if (err) {
        let error = new Error(err.message);
        return next(error);
      }
      users = users.map(function (v) {
        return {
          "username": v.name,
          "display_name": v.display_name
        };
      });
      res.json(users);
    });
  });

  // ユーザーの新規作成
  router.post('/users', function (req, res, next) {
    let username = req.body.username;
    let display_name = req.body.display_name;
    let password = req.body.password;

    userDB.create(username, display_name, password, function (err, user) {
      if (err) {
        let error = new Error(err.message);
        if (user) {
          error.status = 409;
        }
        return next(error);
      }
      res.json({
        'username': user.name,
        'display_name': user.display_name
      });
    });
  });

  // パラメータで指定されたユーザーを取得
  router.get('/users/:username', function (req, res, next) {
    let username = req.params.username;

    userDB.findOneByName(username, function (err, user) {
      if (err) {
        let error = new Error(err.message);
        return next(error);
      }

      res.json({
        'username': user.name,
        'display_name': user.display_name
      });
    });
  });

  // パラメータで指定されたユーザーが作成したボード一覧を取得
  router.get('/users/:username/boards', function (req, res, next) {
    let username = req.params.username;
    boardDB.findAllByUserName(username, function (err, boards) {
      if (err) {
        let error = new Error(err.message);
        return next(error);
      }
      res.json(boards);
    });
  });

  return router;
};
