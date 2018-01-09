const UserDB = require('./userdb');

class BoardDB {
  constructor(connection) {
    this.connection = connection;
    this.userDB = new UserDB(connection);
  }

  findAll(cb) {
    let query = "SELECT * FROM boards JOIN users ON boards.creator_name = users.name";
    this.connection.query(query, function (err, results) {
      if (err) {
        return cb({message: err.message});
      }

      let boards = results.map(function (board) {
        return {
          "id": board.id,
          "title": board.title,
          "creator": {
            "username": board.creator_name,
            "display_name": board.display_name
          },
          "created_at": board.created_at.toString(),
          "updated_at": board.updated_at.toString()
        };
      });

      cb(null, boards);
    });
  }


  findOneById(boardId, cb) {
    let query = "SELECT * FROM boards JOIN users ON boards.creator_name = users.name WHERE boards.id = ?";
    this.connection.query(query, [boardId], function (err, results) {
      if (err) {
        return cb({message: err.sqlMessage});
      }
      switch (results.length) {
        case 1:
          cb(null, {
            "id": results[0].id,
            "title": results[0].title,
            "creator": {
              "username": results[0].creator_name,
              "display_name": results[0].display_name
            },
            "created_at": results[0].created_at,
            "updated_at": results[0].updated_at
          });
          break;
        default:
          return cb({message: 'database panic'})
      }
    });
  }

  findAllByUserName(username, cb) {
    const self = this;
    this.userDB.findOneByName(username, function (err) {
      if (err) {
        return cb(err);
      }
      let query = "SELECT * FROM boards JOIN users ON boards.creator_name = users.name WHERE name = ?";
      self.connection.query(query, [username], function (err, results) {
        if (err) {
          return cb({message: err.sqlMessage});
        }
        let boards = results.map(function (board) {
          return {
            "id": board.id,
            "title": board.title,
            "creator": {
              "username": board.creator_name,
              "display_name": board.display_name
            },
            "created_at": board.created_at.toString(),
            "updated_at": board.updated_at.toString()
          };
        });

        cb(null, boards);
      });
    });
  }

  updateTimeStamp(boardId, cb) {
    const self = this;
    let query = "UPDATE boards SET updated_at = now() WHERE id = ?";
    this.connection.query(query, [boardId], function (err, results) {
      if (err) {
        return cb({message: err.sqlMessage});
      }
      switch (results.changedRows) {
        case 1:
          self.findOneById(boardId, cb);
          break;
        default:
          return cb({message: 'database panic'});
      }
    })

  }

  create(title, username, cb) {
    const self = this;
    this.userDB.findOneByName(username, function (err) {
      if (err) {
        return cb(err);
      }
      let query = "INSERT INTO boards (title, creator_name) VALUES (?, ?)";
      self.connection.query(query, [title, username], function (err, results) {
        if (err) {
          return cb(err);
        }
        self.findOneById(results.insertId, cb);
      });
    });
  }
}

module.exports = BoardDB;