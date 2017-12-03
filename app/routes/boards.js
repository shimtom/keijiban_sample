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

function unknown_board_error(board_id, resource) {
  return {
    "message": "Error unknown board id: " + board_id,
    "error": {
      "resource": resource,
      "code": "404"
    }
  };
}

module.exports = function(connection) {
  var router = express.Router();

  // ボード一覧の取得
  router.get('/boards', function(req, res, next) {
    console.log("GET /boards");

    var query = "SELECT * FROM boards JOIN users ON boards.creator_name = users.name"
    connection.query(query, function(error, results, fields) {
      if (error) {
        res.status(500).json(error.sqlMessage, "boards", error.code);
        return;
      }

      var boards = results.map(function(row) {
        return {
          "id": row.id,
          "title": row.title,
          "creator": {
            "username": row.creator_name,
            "display_name": row.display_name
          },
          "created_at": row.created_at,
          "updated_at": row.updated_at
        };
      });
      res.json(boards);

    });
  });

  // ボードの新規作成
  router.post('/boards', function(req, res, next) {
    console.log("POST /boards");
    var username = req.body.username;

    // username が存在するかを確認.
    var query = "SELECT name, display_name FROM users WHERE name = ?";
    connection.query(query, [username], function(error, results, fields) {
      if (error) {
        res.status(500).json(error.sqlMessage, "boards", error.code);
        return;
      }
      if (results.length > 1) {
        res.status(500).json(sql_error("too many results: " + results.length, "boards", "500"));
        return;
      }
      if (results.length == 0) {
        res.status(404).json(unknown_user_error(username, "boards"));
        return;
      }
      next();
    });
  }, function(req, res, next) {
    var title = req.body.title;
    var username = req.body.username;

    // ボードを新規作成
    var query = "INSERT INTO boards (title, creator_name) VALUES (?, ?)"
    connection.query(query, [title, username], function(error, results, fields) {
      if (error) {
        res.status(500).json(error.sqlMessage, "boards", error.code);
        return;
      }

      var board_id = results.insertId
      console.log(board_id);
      // board_id を次のミドルウェアに渡す方法が不明なためこの場でdbに接続
      // board_idを持つボードを取得
      query = "SELECT * FROM boards JOIN users ON boards.creator_name = users.name WHERE boards.id = ?";
      connection.query(query, [board_id], function(error, results, fields) {
        if (error) {
          res.status(500).json(error.sqlMessage, "boards", error.code);
          return;
        }
        if (results.length != 1) {
          res.status(500).json(sql_error("bad result length: " + results.length, "boards", "500"));
          return;
        }

        var board = {
          "id": results[0].id,
          "title": title,
          "creator": {
            "username": results[0].name,
            "display_name": results[0].display_name
          },
          "created_at": results[0].created_at,
          "updated_at": results[0].updated_at
        };

        res.status(201).json(board);

      });
    });
  });

  // パラメータで指定されたボードを取得
  router.get('/boards/:board_id', function(req, res, next) {
    console.log("GET /boards/:board_id");
    var board_id = req.params.board_id;

    var query = "SELECT * FROM boards JOIN users ON boards.creator_name = users.name WHERE boards.id = ?";
    connection.query(query, [board_id], function(error, results, fields) {
      if (error) {
        res.status(500).json(sql_error(error.sqlMessage, "boards/" + board_id, error.code));
        return;
      }
      if (results.length > 1) {
        res.status(500).json(sql_error("too many results: " + results.length, "boards/" + board_id, "500"));
        return;
      }
      if (results.length == 0) {
        res.status(404).json(unknown_board_error(board_id, "boards/" + board_id));
        return;
      }

      res.json({
        "id": results[0].id,
        "title": results[0].title,
        "creator": {
          "username": results[0].creator_name,
          "display_name": results[0].display_name
        },
        "creator_name": results[0].creator_name,
        "display_name": results[0].display_name
      });

    });
  });

  // パラメータで指定されたボードのコメントを全て取得
  router.get('/boards/:board_id/comments', function(req, res, next) {
    console.log("GET /boards/:board_id/comments");
    var board_id = req.params.board_id;

    // 指定されたboardの存在を確認.
    var query = "SELECT id FROM boards WHERE boards.id = ?";
    connection.query(query, [board_id], function(error, results, fields) {
      if (error) {
        res.status(500).json(sql_error(error.sqlMessage, "boards/" + board_id + "/comments", error.code));
        return;
      }
      if (results.length == 0) {
        res.status(404).json(unknown_board_error(board_id, "boards/" + board_id + "/comments"));
        return;
      }
      next();
    });
  }, function(req, res) {
    var board_id = req.params.board_id;

    // 指定されたボードのコメントを全て取得.
    query = "SELECT * FROM comments JOIN users ON comments.creator_name = users.name WHERE comments.board_id = ?";
    connection.query(query, [board_id], function(error, results, fields) {
      if (error) {
        res.status(500).json(sql_error(error.sqlMessage, "boards/" + board_id + "/comments", error.code));
        return;
      }

      var comments = results.map(function(row) {
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
      res.json(comments);

    });
  });

  // パラメータで指定されたボードにコメントを追加
  router.post('/boards/:board_id/comments', function(req, res, next) {
    console.log("POST /boards/:board_id/comments");
    var board_id = req.params.board_id;

    // 指定されたboardの存在を確認.
    var query = "SELECT id FROM boards WHERE boards.id = ?";
    connection.query(query, [board_id], function(error, results, fields) {
      if (error) {
        res.status(500).json(sql_error(error.sqlMessage, "boards/" + board_id + "/comments", error.code));
        return;
      }
      if (results.length > 1) {
        res.status(500).json(sql_error("too many results: " + results.length, "boards/" + board_id + "/comments", error.code));
        return;
      }
      if (results.length == 0) {
        res.status(404).json(unknown_board_error(board_id, "boards/" + board_id + "/comments"));
        return;
      }
      next();
    });
  }, function(req, res, next) {
    var board_id = req.params.board_id;
    var username = req.body.username;

    // 指定されたusernameの存在を確認
    var query = "SELECT name FROM users WHERE users.name = ?";
    connection.query(query, [username], function(error, results, fields) {
      if (error) {
        res.status(500).json(sql_error(error.sqlMessage, "boards/" + board_id + "/comments", error.code));
        return;
      }
      if (results.length > 1) {
        res.status(500).json(sql_error("too many results: " + results.length, "boards/" + board_id + "/comments", error.code));
        return;
      }
      if (results.length == 0) {
        res.status(404).json(unknown_user_error(username, "boards/" + board_id + "/comments"));
        return;
      }
      next();
    });
  }, function(req, res) {
    var board_id = req.params.board_id;
    var username = req.body.username;
    var content = req.body.content;

    // 指定されたボードにコメントを追加
    var query = "INSERT INTO comments (board_id, content, creator_name) VALUES (?, ?, ?);";
    connection.query(query, [board_id, content, username], function(error, results, fields) {
      if (error) {
        res.status(500).json(sql_error(error.sqlMessage, "boards/" + board_id + "/comments", error.code));
        return;
      }
      var comment_id = results.insertId;

      // 追加されたコメントを取得
      query = "select * from comments JOIN users ON comments.creator_name = users.name WHERE comments.id = ?";
      connection.query(query, [comment_id], function(error, results, fields) {
        if (error) {
          res.status(500).json(sql_error(error.sqlMessage, "boards/" + board_id + "/comments", error.code));
          return;
        }
        if (results.length != 1) {
          res.status(500).json(sql_error("bad result length: " + results.length, "boards/" + board_id + "/comments", "500"));
          return;
        }

        var comment = {
          "id": results[0].id,
          "board_id": results[0].board_id,
          "content": results[0].content,
          "created_at": results[0].created_at,
          "updated_at": results[0].updated_at,
          "creator": {
            "username": results[0].creator_name,
            "display_name": results[0].display_name
          }
        };
        res.status(201).json(comment);
      });
    });
  });

  return router;
};
