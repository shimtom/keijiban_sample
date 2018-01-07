var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  if (req.user) {
    console.log('index');
    res.render('index', {title: '匿名掲示板'})
  } else {
    console.log('sign');
    res.render('sign', {status: 'logout'});
  }
});

module.exports = router;
