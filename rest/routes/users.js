// 必要なパッケージの読み込み
let express = require('express');


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

module.exports = function (connection) {
  let router = express.Router();

  // ユーザー一覧の取得
  router.get('/users', function (req, res) {
    console.log("GET /users");

    let query = "SELECT * FROM users";
    connection.query(query, function (error, results) {
      if (error) {
        res.status(500).json(sql_error(error.sqlMessage, "users", error.code));
        return;
      }

      let users = results.map(function (row) {
        return {
          "username": row.name,
          "display_name": row.display_name
        };
      });
      res.json(users);
    });
  });

  // パラメータで指定されたユーザーを取得
  router.get('/users/:username', function (req, res) {
    console.log('GET /users/:username');
    let username = req.params.username;

    let query = "SELECT * FROM users WHERE name = ?";
    connection.query(query, [username], function (error, results) {
      if (error) {
        res.status(500).json(sql_error(error.sqlMessage, "users/" + username, error.code));
        return;
      }
      if (results.length === 0) {
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
  router.get('/users/:username/boards', function (req, res, next) {
    console.log("GET /users/:username/boards");
    let username = req.params.username;

    // 指定されたユーザーの存在の確認
    let query = "SELECT name FROM users WHERE name = ?";
    let flag = false;
    connection.query(query, [username], function (error, results) {
      if (error) {
        res.status(500).json(sql_error(error.sqlMessage, "users/" + username + "/boards", error.code));
        flag = true;
        return;
      }
      if (results.length === 0) {
        res.status(404).json(unknown_user_error(username, "users/" + username + "/boards"));
        flag = true;
        return;
      }
      next();
    });
  }, function (req, res) {
    // ユーザーが作成したボード一覧を取得
    let username = req.params.username;
    let query = "SELECT * FROM boards JOIN users ON boards.creator_name = users.name WHERE name = ?";
    connection.query(query, [username], function (error, results) {
      if (error) {
        res.status(500).json(sql_error(error.sqlMessage, "users/" + username + "/boards", error.code));
        return;
      }

      let boards = results.map(function (row) {
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
