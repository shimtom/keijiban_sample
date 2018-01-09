// 必要なパッケージの読み込み
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let logger = require('morgan');
let mysql = require('mysql');
let session = require('express-session');
let MySQLStore = require('express-mysql-session')(session);
let flash = require('connect-flash');
const authChecker = require('./middleware/auth');

// 分割したファイルを読み込み
let users = require('./routes/users');
let boards = require('./routes/boards');
let sign = require('./routes/sign');
let index = require('./routes/index');

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
    app.use(logger('dev'));
    app.use(flash());
    let sessionStore = new MySQLStore({
      schema: {
        tableName: 'sessions',
        columnNames: {
          session_id: 'session_id',
          expires: 'expires',
          data: 'data'
        }
      }
    }, connection);
    app.use(session({
      secret: 'keyboard cat',
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false
      }
    }));
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
        res.send(200);
      }
      else {
        next();
      }
    });

    // auth setting
    app.set('superSecret', 'secret');

    // routing
    app.use('/', authChecker(connection).checkAuth([
      {url: '/', method: 'GET'},
      {url: '/login', method: 'POST'},
      {url: '/api/users', method: 'POST'}
    ]));
    app.use('/', index);
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
