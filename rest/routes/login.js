// 必要なパッケージの読み込み
let express = require('express');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;

class User {
  constructor(connection) {
    this.connection = connection;
  }

  getAll(cb) {
    let query = "SELECT * FROM users";
    this.connection.query(query, function (error, results) {
      if (error) {
        return cb({'msg': error.sqlMessage});
      }
      cb(null, results);
    });
  }

  findByName(name, cb) {
    let query = "SELECT * FROM users WHERE name = ?";
    this.connection.query(query, [name], function (error, results) {
      if (error) {
        return cb({'msg': error.sqlMessage});
      }
      switch (results.length) {
        case 0:
          cb({'msg': 'unknown username: ' + name});
          break;
        case 1:
          cb(null, results[0]);
          break;
        default:
          cb({'msg': 'database panic'});
      }
    })
  }

  create(name, displayname, password, cb) {
    let query = "INSERT INTO users(name, display_name, password) VALUES (?, ?, ?)";
    this.connection.query(query, [name, displayname, password], function (error) {
      if (error) {
        switch (error.code) {
          case 'ER_DUP_ENTRY':
            cb({'msg': 'duplicated username: ' + name});
            break;
          default:
            cb({'msg': error.sqlMessage});
        }
      } else {
        this.findByName(name, cb);
      }
    });
  }
}

module.exports = function (connection) {
  let router = express.Router();
  let userDB = new User(connection);
  // passport setting
  passport.serializeUser(function (user, done) {
    console.log('serialize user');
    console.log('user', user);
    done(null, {'name': user.name});
  });
  passport.deserializeUser(function (user, done) {
    console.log('deserialize user');
    console.log('username', user);

    userDB.findByName(user.name, function (error, user) {
      if (error) {
        done(error);
      } else {
        done(null, {'name': user.name});
      }
    });
  });
  passport.use(new LocalStrategy(function (username, password, done) {
    console.log('local strategy');
    console.log('username', username);
    console.log('password', password);

    userDB.findByName(username, function (error, user) {
      if (error) {
        done(error);
      } else {
        done(null, {'name': user.name});
      }
    });

  }));

  router.post('/login', passport.authenticate('local', {
      failureRedirect: '/',
      failureFlash: true
    }), function (req, res) {
      res.json({'username': req.body.username});
      // res.redirect('/');
    }
  );

  router.get('/logout', function (req, res) {
    console.log('logout');
    if (req.session && req.user) {
      req.session.destroy();
      res.json({
        'username': req.user.name,
      });
    } else {
      req.flash('error', 'ログインしていません.');
      res.redirect('/');
    }
  });

  // ユーザーの新規作成
  router.post('/users', function (req, res) {
    console.log('POST /users');
    let username = req.body.username;
    let display_name = req.body.display_name;
    let password = req.body.password;

    userDB.create(username, display_name, password, function (error, user) {
      if (error) {
        res.status(400).json({
          'message': error.msg,
          'error': {
            'resource': 'users'
          }
        });
      } else {
        res.status(201).json({
          'username': user.name,
          'display_name': user.display_name
        });
      }
    });
  });

  return router
};
