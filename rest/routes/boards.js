// 必要なパッケージの読み込み
const express = require('express');
const BoardDB = require('../model/boarddb');
const CommentDB = require('../model/commentdb');
const AuthChecker = require('../middleware/auth');

module.exports = function (connection) {
  const router = express.Router();
  const boardDB = new BoardDB(connection);
  const commentDB = new CommentDB(connection);
  const getTokenFromAuthorizationHeader = AuthChecker(connection).getTokenFromAuthorizationHeader;
  const checkUser = AuthChecker(connection).checkUser;

  // ボード一覧の取得
  router.get('/boards', function (req, res, next) {
    boardDB.findAll(function (err, boards) {
      if (err) {
        let error = new Error(err.message);
        next(error);
      }
      res.json(boards);
    });
  });

  // ボードの新規作成
  router.post('/boards', function (req, res, next) {
    let title = req.body.title;
    let username = req.body.username;

    checkUser(username, getTokenFromAuthorizationHeader(req), req.app.get('superSecret'), function (err) {
      if (err) {
        let error = new Error(err.message);
        error.status = 403;
        next(error);
      }
      boardDB.create(title, username, function (err, board) {
        if (err) {
          let error = new Error(err.message);
          error.status = 404;
          next(error);
        }
        res.status(201).json(board);
      });
    });
  });

  // パラメータで指定されたボードを取得
  router.get('/boards/:board_id', function (req, res, next) {
    let boardId = req.params.board_id;
    boardDB.findOneById(boardId, function (err, board) {
      if (err) {
        let error = new Error(err.message);
        error.status = 404;
        next(error);
      }
      res.json(board);
    });
  });

  // パラメータで指定されたボードのコメントを全て取得
  router.get('/boards/:board_id/comments', function (req, res, next) {
    let boardId = req.params.board_id;
    commentDB.findAllByBoardId(boardId, function (err, comments) {
      if (err) {
        let error = new Error(err.message);
        error.status = 404;
        next(error);
      }
      res.json(comments);
    });
  });

  // パラメータで指定されたボードにコメントを追加
  router.post('/boards/:board_id/comments', function (req, res, next) {
    let boardId = req.params.board_id;
    let username = req.body.username;
    let content = req.body.content;

    checkUser(username, getTokenFromAuthorizationHeader(req), req.app.get('superSecret'), function (err) {
      if (err) {
        let error = new Error(err.message);
        error.status = 403;
        return next(error);
      }

      commentDB.create(boardId, username, content, function (err, comment) {
        if (err) {
          let error = new Error(err.message);
          error.status = 404;
          return next(error);
        }
        res.status(201).json(comment);
      });
    });

  });

  return router;
};
