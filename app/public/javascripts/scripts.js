var host = "http://db";
var user = "admin";
var board_id = 1;

// コメントを取得し,描画する.
function render_comments(){
  var comments = $("#comments");
  console.log("rendoer comments");
  $.getJSON(host + "/api/boards/" + board_id + "/comments", function(res){
    console.log("render comments");

    comments.empty();
    res.forEach(function(value, index) {
      var created_at = value.created_at;
      var content = value.content;

      var header = $("<div>", {
        "class": "panel-heading",
        "text": (index + 1) + ". 匿名: " +  created_at
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
function post_comment(){
  $('#comment-form button').on('click', function() {
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
    $.post(host + "/api/boards/"+ board_id +"/comments", comment,function(res) {
      render_comments();
    });

  });
}

post_comment();
render_comments();
