var host = "http://127.0.0.1:3000";
var user = "admin";
var board_id = 1;


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

function renderBoardList() {
  let boardList = $('#board-list');
  if (boardList) {
    console.log('board list render');
    $.ajax(host + '/api/boards', {
      type: 'GET'
    }).done(function (data) {
      data.forEach(function (v, i) {
        console.log(v);
        let board = $("<tr>").addClass('board').attr({'scope': 'row', 'data-board-id':v.id});
        let index = $("<th>").text(i + 1);
        let title = $("<th>").text(v.title);
        let creator = $("<td>").text(v.creator.display_name);
        let createdTime = $("<td>").text(v.created_at);
        let updatedTime = $("<td>").text(v.updated_at);
        board.append(index, title, creator, createdTime, updatedTime);
        board.on('click', function () {
          let id = $(this).attr('data-board-id');
          $.get(host + '/' + id);
        });
        boardList.append(board);
      });
    })
  }
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

renderBoardList();
post_comment();
render_comments();
init();

