class UserDB {
  constructor(connection) {
    this.connection = connection;
  }

  findAll(cb) {
    let query = "SELECT * FROM users";
    this.connection.query(query, function (error, results) {
      if (error) {
        return cb({message: error.sqlMessage});
      }
      let users = results.map(function (v) {
        let user = Object.assign({}, v);
        user.stamp = user.stamp.toString();
        return user;
      });
      cb(null, users);
    });
  }

  findOneByName(name, cb) {
    let query = "SELECT * FROM users WHERE name = ?";
    this.connection.query(query, [name], function (error, results) {
      if (error) {
        return cb({message: error.sqlMessage});
      }
      switch (results.length) {
        case 0:
          cb({message: 'unknown username: ' + name});
          break;
        case 1:
          let user = Object.assign({}, results[0]);
          user.stamp = user.stamp.toString();
          cb(null, user);
          break;
        default:
          cb({message: 'database panic'});
      }
    })
  }

  updateStamp(name, cb) {
    const self = this;
    let query = "UPDATE users SET stamp = now() WHERE name = ?";
    this.connection.query(query, [name], function (error, results) {
      if (error) {
        return cb({message: error.sqlMessage});
      }
      switch (results.changedRows) {
        case 1:
          self.findOneByName(name, cb);
          break;
        default:
          return cb({message: 'database panic'});
      }
    })
  }

  create(username, displayname, password, cb) {
    const self = this;
    let query = "INSERT INTO users(name, display_name, password) VALUES (?, ?, ?)";
    this.connection.query(query, [username, displayname, password], function (err) {
      if (err) {
        switch (err.code) {
          case 'ER_DUP_ENTRY':
            self.findOneByName(username, function (err, user) {
              if (err) {
                return cb(err);
              }
              cb({message: user.name + ' already exists.'}, user);
            });
            break;
          default:
            cb({message: err.sqlMessage});
        }
      } else {
        self.findOneByName(username, cb);
      }
    });
  }

}

module.exports = UserDB;
