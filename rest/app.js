// 必要なパッケージの読み込み
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const mysql = require('mysql');
const authChecker = require('./middleware/auth');

// 分割したファイルを読み込み
const users = require('./routes/users');
const boards = require('./routes/boards');
const sign = require('./routes/sign');

let app = express();

function main() {
  // mysql setting
  let options = {
    connectionLimit: 10,
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_ROOT_USER || 'root',
    password: process.env.DB_ROOT_PASSWORD || 'root',
    database: process.env.DB_NAME || 'bulletin_board',
    debug: false
  };
  let pool = mysql.createPool(options);
  pool.getConnection(function (err, connection) {
    if (err) {
      console.error('cannot connect mysql db.');
      console.error(err);
      process.exit(1);
    }
    console.log('mysql connected!');

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'pug');

    // express setting
    app.set('superSecret', 'secret');

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      // res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

      // intercept OPTIONS method
      if ('OPTIONS' === req.method) {
        res.sendStatus(200);
      }
      else {
        next();
      }
    });


    // routing
    app.use('/', authChecker(connection).checkAuth([
      {url: '/', method: 'GET'},
      {url: '/login', method: 'POST'},
      {url: '/api/users', method: 'POST'}
    ]));
    app.use('/', sign(connection));
    app.use('/api/', users(connection));
    app.use('/api/', boards(connection));


    app.use(function (req, res, next) {
      let err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    app.use(function (err, req, res, next) {
      console.log(err.stack || 'Error :' + err.message);

      res.status(err.status || 500).json({
        message: err.message,
        error: {
          resource: req.url,
          code: err.code || err.status || 500
        }
      });
    });

    console.log('server launch');
  });

}

main();

module.exports = app;
