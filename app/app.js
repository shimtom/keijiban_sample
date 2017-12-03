// @flow
// 必要なパッケージの読み込み
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var basicAuth = require('basic-auth-connect');

// 分割したファイルを読み込み
var index = require('./routes/index');
var users = require('./routes/users');
var boards = require('./routes/boards');

var app = express();

function main(){
  var pool = mysql.createPool({
    connectionLimit : 10,
    host: 'db',
    user: 'root',
    password: 'root',
    database: 'bulletin_board',
    debug:  false

  });
  pool.getConnection(function(error, connection){
    if (error) {
      console.error("cannot connect mysql db.");
      console.error(error);
      process.exit(1);
    }
    console.log('mysql connected!');
    console.log('start rest api server.');

    // basic 認証
    var username = process.env.BASIC_AUTH_USERNAME || "user";
    var password = process.env.BASIC_AUTH_PASSWORD || "password";
    app.use(basicAuth(username, password));

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'pug');

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false}));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    // app.use('/login', login(connection));
    app.use('/', index);
    app.use('/app/', index);
    app.use('/api/', users(connection));
    app.use('/api/', boards(connection));

    // Not Found エラーを設定し,エラーハンドラーへ渡す.
    app.use(function(req, res, next) {
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    app.use(function(err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });
  });
}

main();

module.exports = app;
