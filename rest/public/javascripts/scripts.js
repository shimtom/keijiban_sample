var host = "http://127.0.0.1:3000";
var user = "admin";
var board_id = 1;

function signin() {
  var username = $('#login_field').val();
  var password = $('#password').val();

  if (username.length === 0 || password.length === 0) {
    showAlert('username and password can\'t be blank');
    return;
  }

  var data = {
    'username': username,
    'password': password
  };


  $.ajax(host + '/login', {
    type: 'POST',
    crossDomain: true,
    data: data
    // xhrFields: {
    //   withCredentials: true
    // }
  })
    .done(function (res, textStatus, jqXHR) {
      console.log('login response');
      console.log(res);
      console.log(jqXHR);

      $(document).html(res);
      if (res.username === username && res.status === 'login') {
        console.log('認証成功');
        console.log(res);
        console.log(textStatus);
        console.log(jqXHR);
        // location.replace(location.origin);
        console.log(location)
      }
    })
    .fail(function (jqXHR) {
      var res = jqXHR.responseJSON || {};
      var msg = res.message || 'sign in error';
      showAlert(msg);
    });

}

function signup() {
  var username = $('#inputUsername').val();
  var displayname = $('#inputDisplayname').val();
  var password = $('#inputPassword').val();

  if (username.length === 0 || password.length === 0) {
    showAlert('username and password can\'t be blank');
    return;
  }

  console.log('sign up ...');

  var req = {
    'username': username,
    'display_name': displayname,
    'password': password
  };

  $.post(host + '/api/users', req)
    .done(function (res) {
      console.log(res);
      console.log('登録成功');
      location.replace(location.origin);
    })
    .fail(function (jqXHR) {
      var res = jqXHR.responseJSON || {};
      var msg = res.message || 'sign up error';
      showAlert(msg);
    });
}

function init() {
  // init_alert();
  // $('button#signup').on('click', function () {
  //   console.log('signup clicked');
  //   signup();
  // });

  // $('button#signin').on('click', function () {
  //   console.log('sign in clicked');
  //   signin();
  // });

}

// コメントを取得し,描画する.
function render_comments() {
  var comments = $("#comments");
  console.log("rendoer comments");

  $.ajax(host + '/api/boards/' + board_id + '/comments', {
    type: 'GET',
    crossDomain: true
  })
    .done(function (res) {
      console.log("render comments");
      comments.empty();
      res.forEach(function (value, index) {
        var created_at = value.created_at;
        var content = value.content;

        var header = $("<div>", {
          "class": "panel-heading",
          "text": (index + 1) + ". 匿名: " + created_at
        });

        var body = $("<div>", {
          "class": "panel-body",
          "text": content
        });

        var panel = $("<div>", {
          "class": "panel panel-default comment-panel"
        });

        panel.append(header);
        panel.append(body);

        comments.append(panel);
      });

    });
}


// コメントをポストする.
function post_comment() {
  $('#comment-form button').on('click', function () {
    console.log('post comment');
    // comment form の値を取得
    var textarea = $("#comment-form textarea");
    var content = textarea.val();
    if (content.length == 0) {
      console.log('no comments.')
      return;
    }
    textarea.val("");
    var comment = {
      "content": content,
      "username": user
    };
    console.log('comment:', comment);
    $.post(host + "/api/boards/" + board_id + "/comments", comment, function (res) {
      render_comments();
    });

  });
}

function init_alert() {
  var alert = $('#alert');
  if (alert) {
    alert.hide();
    alert.children('button.close').on('click', function (e) {
      e.preventDefault();
      alert.addClass('hidden');
      alert.hide();
    });
  }
}

function showAlert(text) {
  var alert = $('#alert');
  if (alert) {
    alert.children('.alert-text').text(text);
    alert.removeClass('hidden');
    alert.show();
  }
}

post_comment();
render_comments();
init();

