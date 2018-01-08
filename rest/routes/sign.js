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
    const self = this;
    let query = "INSERT INTO users(name, display_name, password) VALUES (?, ?, ?)";
    this.connection.query(query, [name, displayname, password], function (error) {
      if (error) {
        switch (error.code) {
          case 'ER_DUP_ENTRY':
            cb({'msg': name + ' already exists.'});
            break;
          default:
            cb({'msg': error.sqlMessage});
        }
      } else {
        self.findByName(name, cb);
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
        done(null, false, error.msg);
      }
      if (user) {
        done(null, {'name': user.name});
      } else {
        done(null, false, 'incorrect username');
      }
    });
  });
  passport.use(new LocalStrategy(function (username, password, done) {
    console.log('local strategy');
    console.log('username', username);
    console.log('password', password);

    userDB.findByName(username, function (error, user) {
      if (error) {
        done(error.msg);
      }
      if (user && user.password === password) {
        done(null, {'name': user.name});
      } else {
        done(null, false, 'incorrect username or password');
      }
    });

  }));

  router.post('/login', passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/',
      failureFlash: true
    })
  );

  router.get('/logout', function (req, res) {
    console.log('logout');
    if (req.session && req.user) {
      req.logout();
      res.redirect('/');
    } else {
      req.flash('error', 'ログインしていません.');
      res.redirect('/');
    }
  });

  // ユーザーの新規作成
  router.post('/api/users', function (req, res, next) {
    console.log('POST /api/users');
    let username = req.body.username;
    let display_name = req.body.display_name;
    let password = req.body.password;

    userDB.create(username, display_name, password, function (error, user) {
      if (error || user === undefined) {
        req.flash('error', error.msg);
        return res.redirect('/');
      }
      req.login(user, function (err) {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    });
  });

  return router
};
