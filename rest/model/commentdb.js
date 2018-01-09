let BoardDB = require('boarddb');
let UserDB = require('userdb');

class CommentDB {
  constructor(connection) {
    this.connection = connection;
    this.boardDB = new BoardDB(connection);
    this.userDB = new UserDB(connection);
  }

  findAllByBoardId(boardId, cb) {
    const self = this;
    this.boardDB.findOneById(boardId, function (err) {
      if (err) {
        return cb(err);
      }
      let query = "SELECT * FROM comments JOIN users ON comments.creator_name = users.name WHERE comments.board_id = ?";
      self.connection.query(query, [board_id], function (error, results) {
        if (error) {
          return cb({'msg': error.sqlMessage, 'code': -1});
        }
        console.log('get all comment', results);
        let comments = results.map(function (row) {
          return {
            "id": row.id,
            "board_id": row.board_id,
            "content": row.content,
            "created_at": row.created_at,
            "updated_at": row.updated_at,
            "creator": {
              "username": row.creator_name,
              "display_name": row.display_name
            }
          };
        });
        let board = {
          "id": results[0].id,
          "title": results[0].title,
          "creator": {
            "username": results[0].creator_name,
            "display_name": results[0].display_name
          },
          "comments": comments,
          "created_at": results[0].created_at.toString(),
          "updated_at": results[0].updated_at.toString()
        };
        console.log(board);

        cb(null, comments);
      });
    });
  }

  findOneById(id, cb) {
    let query = "select * from comments JOIN users ON comments.creator_name = users.name WHERE comments.id = ?";
    this.connection.query(query, [id], function (error, results) {
      if (error) {
        return cb({message: error.sqlMessage});
      }
      if (results.length !== 1) {
        return cb({message: 'database panic'});
      }

      cb(null, {
        "id": results[0].id,
        "board_id": results[0].board_id,
        "content": results[0].content,
        "creator": {
          "username": results[0].creator_name,
          "display_name": results[0].display_name
        },
        "created_at": results[0].created_at.toString(),
        "updated_at": results[0].updated_at.toString(),
      });
    });
  }

  create(boardId, username, comment, cb) {
    const self = this;
    this.boardDB.findOneById(boardId, function (error) {
      if (error) {
        return cb(error);
      }
      self.userDB.findOneByName(username, function (error) {
        if (error) {
          return cb(error);
        }
        let query = "INSERT INTO comments (board_id, content, creator_name) VALUES (?, ?, ?);";
        self.connection.query(query, [boardId, comment, username], function (error, results) {
          if (error) {
            return cb(error);
          }
          let comment_id = results.insertId;
          self.findOneById(comment_id, cb);
        });
      });
    });
  }
}

module.exports = CommentDB;