let express = require('express');
let router = express.Router();

router.get('/', function (req, res) {
  if (req.user) {
    res.render('index', {title: '匿名掲示板', username: req.user.name});
  } else {
    res.render('sign', {alertFlash: req.flash('error')});
  }
});


module.exports = router;
