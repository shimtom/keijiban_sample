let express = require('express');
let router = express.Router();

router.get('/', function (req, res, next) {
  console.log('index page');
  console.log('request session', req.session);
  console.log('session id', req.sessionID);
  console.log('request user', req.user);

  if (req.user) {
    res.render('index', {title: '匿名掲示板', status: 'login'});
  } else {
    res.render('sign', {alertFlash: req.flash('error')});
  }
});


module.exports = router;
