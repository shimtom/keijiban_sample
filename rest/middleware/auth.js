const jwt = require('jsonwebtoken');
const UserDB = require('../model/userdb');

module.exports = function (connection) {
  function checkUser(username, token, secret, cb){
    checkToken(token, secret, function (err, user) {
      if (err) {
        return cb(err);
      }
      console.log(user);
      if (user.name !== username) {
        cb({message: 'Invalid username: ' + username});
      }
      cb(null, user);
    })
  }
  function checkToken(token, secret, cb) {
    console.log('Check Token');
    jwt.verify(token, secret, function (err, decoded) {
      if (err) {
        return cb({message: 'Invalid token'});
      }

      let decodedUser = decoded;
      let userDB = new UserDB(connection);
      userDB.findOneByName(decodedUser.name, function (err, user) {
        if (err) {
          return cb({message: err.message});
        }
        let correct = true;
        correct = correct && decodedUser.name === user.name;
        correct = correct && decodedUser.password === user.password;
        correct = correct && decodedUser.display_name === user.display_name;
        correct = correct && decodedUser.stamp.toString() === user.stamp.toString();

        if (!correct) {
          return cb({message: 'Invalid token'});
        }
        cb(null, user);
      })
    })
  }

  function _checkAuth(whitetList) {
    function checkAuth(req, res, next) {
      console.log('Check Auth');
      if (!whitetList) {
        whitetList = [];
      }
      let white = whitetList.some(function (value) {
        return value.url === req.url && value.method === req.method;
      });
      if (white) {
        return next();
      }

      let token = getTokenFromAuthorizationHeader(req);
      checkToken(token, req.app.get('superSecret'), function (err, user) {
        if (err) {
          let error = new Error(err.message);
          error.status = 403;
          return next(error);
        }

        next();
      });
    }
    return checkAuth
  }

  function getTokenFromAuthorizationHeader(req) {
    let token = '';
    if (req.headers['authorization']) {
      token = req.headers['authorization'].match(/(\S+)\s+(\S+)/)[2];
    }
    return token;
  }

  return {
    checkAuth: _checkAuth,
    checkToken: checkToken,
    checkUser: checkUser,
    getTokenFromAuthorizationHeader: getTokenFromAuthorizationHeader
  };

};