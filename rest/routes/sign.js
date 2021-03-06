// 必要なパッケージの読み込み
const express = require('express');
const jwt = require('jsonwebtoken');
const UserDB = require('../model/userdb');
const AuthChecker = require('../middleware/auth');

module.exports = function (connection) {
  let router = express.Router();
  let userDB = new UserDB(connection);
  const checkToken = AuthChecker(connection).checkToken;

  router.post('/login', function (req, res, next) {
    console.log('POST /login');
    let username = req.body.username;
    let password = req.body.password;

    if (!username && !password && req.headers['authorization']) {
      let token = req.headers['authorization'].match(/(\S+)\s+(\S+)/)[2];
      return checkToken(token, req.app.get('superSecret'), function (err, user) {
        if (err) {
          let error = new Error(err.message);
          error.status = 403;
          return next(error);
        }
        res.json({
          'username': user.name,
          'display_name': user.display_name,
          'token': token
        });
      });
    }

    userDB.findOneByName(username, function (err, user) {
      if (err) {
        let error = new Error(err.message);
        error.status = 404;
        return next(error);
      }
      if (!user || user.password !== password) {
        let error = new Error('incorrect username or password');
        error.status = 404;
        return next(error);
      }

      let token = jwt.sign(user, req.app.get('superSecret'), {
        expiresIn: '24h'
      });

      res.json({
        'username': user.name,
        'display_name': user.display_name,
        'token': token
      });
    });
  });

  router.get('/logout', function (req, res, next) {
    console.log('logout');
    if (!req.headers['authorization']) {
      let error = new Error('You does not sign in');
      error.status = 400;
      next(error);
    }

    let token = req.headers['authorization'].match(/(\S+)\s+(\S+)/)[2];
    checkToken(token, req.app.get('superSecret'), function (err, user) {
      if (err) {
        let error = new Error(err.message);
        error.status = 403;
        return next(error);
      }

      // データを更新することでjwt tokenを変更させる
      return userDB.updateStamp(user.name, function (err, user) {
        if (err) {
          next(new Error(err.message));
        }
        res.json({
          'username': user.name,
          'display_name': user.display_name
        });
      });
    });
  });

  return router
};
