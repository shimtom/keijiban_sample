// @flow
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

module.exports = function(connection) {
  var router = express.Router();

  // ユーザー一覧の取得
  router.get('/users', function(req, res, next) {
    console.log("GET /users");

    var query = "SELECT * FROM users"
    connection.query(query, function(error, results, fields) {
      if (error) {
        res.status(500).json(sql_error(error.sqlMessage, "users", error.code));
        return;
      }

      var users = results.map(function(row) {
        return {
          "username": row.name,
          "display_name": row.display_name
        };
      });
      res.json(users);
    });
  });

  // ユーザーの新規作成
  router.post('/users', function(req, res, next) {
    console.log('POST /users');
    var username = req.body.username;
    var display_name = req.body.display_name;
    var password = req.body.password;

    var query = "INSERT INTO users(name, display_name, password) VALUES (?, ?, ?)";
    connection.query(query, [username, display_name, password], function(error, results, fields) {
      if (error) {
        switch (error.code) {
          case 'ER_DUP_ENTRY':
            res.status(409).json({
              "message": "Error duplicated username: " + username,
              "error": {
                "resource": "users",
                "code": "409"
              }
            });
            break;
          default:
            res.status(500).json(sql_error(error.sqlMessage, "users", error.code));
            break;
        }
        return;
      }

      res.status(201).json({
        "username": username,
        "display_name": display_name
      });
    });
  });

  // パラメータで指定されたユーザーを取得
  router.get('/users/:username', function(req, res, next) {
    console.log('GET /users/:username');
    var username = req.params.username;

    var query = "SELECT * FROM users WHERE name = ?";
    connection.query(query, [username], function(error, results, fields) {
      if (error) {
        res.status(500).json(sql_error(error.sqlMessage, "users/" + username, error.code));
        return;
      }
      if (results.length == 0) {
        res.status(404).json(unknown_user_error(username, "users/" + username));
        return;
      }

      res.json({
        "username": username,
        "display_name": results[0].display_name
      });
    });
  });

  // パラメータで指定されたユーザーが作成したボード一覧を取得
  router.get('/users/:username/boards', function(req, res, next) {
    console.log("GET /users/:username/boards");
    var username = req.params.username;

    // 指定されたユーザーの存在の確認
    var query = "SELECT name FROM users WHERE name = ?";
    var flag = false;
    connection.query(query, [username], function(error, results, fields) {
      if (error) {
        res.status(500).json(sql_error(error.sqlMessage, "users/" + username + "/boards", error.code));
        flag = true;
        return;
      }
      if (results.length == 0) {
        res.status(404).json(unknown_user_error(username, "users/" + username + "/boards"))
        flag = true;
        return;
      }
      next();
    });
  }, function(req, res) {
    // ユーザーが作成したボード一覧を取得
    var username = req.params.username;
    var query = "SELECT * FROM boards JOIN users ON boards.creator_name = users.name WHERE name = ?";
    connection.query(query, [username], function(error, results, fields) {
      if (error) {
        res.status(500).json(sql_error(error.sqlMessage, "users/" + username + "/boards", error.code));
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

  return router;
};
