let UserDB = require('./userdb');

class BoardDB {
  constructor(connection) {
    this.connection = connection;
    this.userDB = new UserDB(connection);
  }

  findAll(cb) {
    let query = "SELECT * FROM boards JOIN users ON boards.creator_name = users.name";
    this.connection.query(query, function (error, results) {
      if (error) {
        cb({'msg': error.sqlMessage, 'code': error.code});
      } else {
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

        cb(boards);
      }
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
            "creator_name": results[0].creator_name,
            "display_name": results[0].display_name
          });
          break;
        default:
          return cb({message: 'database panic'})
      }
    });
  }

  findAllByUserName(username, cb) {
    this.userDB.findOneByName(username, function (err) {
      if (err) {
        return cb(err);
      }
      let query = "SELECT * FROM boards JOIN users ON boards.creator_name = users.name WHERE name = ?";
      this.connection.query(query, [username], function (err, results) {
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

  create(title, username, cb) {
    this.userDB.findOneByName(username, function (err) {
      if (err) {
        return cb(err);
      }
      let query = "INSERT INTO boards (title, creator_name) VALUES (?, ?)";
      this.connection.query(query, [title, username], function (err, results) {
        if (err) {
          return cb(err);
        }
        this.findById(results.insertId, cb);
      });
    });
  }
}

module.exports = BoardDB;