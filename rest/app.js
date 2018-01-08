// 必要なパッケージの読み込み
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let mysql = require('mysql');
let session = require('express-session');
let MySQLStore = require('express-mysql-session')(session);
let passport = require('passport');
let flash = require('connect-flash');

// 分割したファイルを読み込み
let users = require('./routes/users');
let boards = require('./routes/boards');
let sign = require('./routes/sign');

let index = require('./routes/index');

let app = express();


function checkSession(req, res, next) {
  console.log('Check session');
  console.log('url', req.url);
  let whitetList = [
    {url: '/', method: 'GET'},
    {url: '/login', method: 'POST'},
    {url: '/logout', method: 'GET'},
    {url: '/api/users', method: 'POST'}
  ];
  let allowed = whitetList.some(function (value) {
    return value.url === req.url && value.method === req.method;
  });
  console.log('need authentication', !allowed);
  console.log('check session', req.user !== undefined);
  console.log('session id', req.sessionID);
  console.log('request user', req.user);

  if (allowed || req.user !== undefined) {
    next();
  } else {
    res.status(401).json({
      "message": "Unauthorized",
      "error": {
        "resource": req.url,
        "code": '401'
      }
    });
  }
}

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
  pool.getConnection(function (error, connection) {
    if (error) {
      console.error('cannot connect mysql db.');
      console.error(error);
      process.exit(1);
    }
    console.log('mysql connected!');

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'pug');

    // express setting
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
    app.use(passport.initialize());
    app.use(passport.session());

    // routing
    app.use('/', checkSession);
    app.use('/', index);
    app.use('/', sign(connection));
    app.use('/api/', users(connection));
    app.use('/api/', boards(connection));

    // error handler setting
    app.use(function (req, res, next) {
      let err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    app.use(function (err, req, res) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error');
    });

    console.log('server launch');
  });

}

main();

module.exports = app;
