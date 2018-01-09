function get(url) {
  let options = {
    type: 'GET',
  };
  let token = sessionStorage.getItem('token');
  if (token) {
    options.headers = {'authorization': 'bearer ' + token};
  }
  return $.ajax(url, options);
}

function post(url, data) {
  let options = {
    type: 'POST',
    data: data
  };
  let token = sessionStorage.getItem('token');
  if (token) {
    options.headers = {'authorization': 'bearer ' + token};
  }
  return $.ajax(url, options);
}

function main(host) {

  class Controller {
    constructor(host) {
      this.host = host;
      this.data = null;
      this.header = $('header');
      this.container = $('#container.container-fluid')
    }

    login(username, password) {
      const self = this;
      let user = {
        'username': username,
        'password': password
      };
      post(host + '/login', user).done(function (res) {
        console.log('Success POST /login');
        let username = res.username;
        let displayName = res.display_name;
        let token = res.token;

        sessionStorage.setItem('username', username);
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('display_name', displayName);
        self.pageBoardList();
      }).fail(function (jqXHR) {
        let res = jqXHR.responseJSON || {};
        let msg = res.message || 'sign in error';
        self.alert(msg);
      });
    }

    logout() {
      const self = this;
      get(this.host + '/logout').done(function () {
        sessionStorage.clear();
        self.pageSign();
      })
    }

    signUp(username, displayName, password) {
      const self = this;
      let user = {
        'username': username,
        'display_name': displayName,
        'password': password
      };
      post(this.host + '/api/users', user).done(function () {
        self.login(username, password);
      }).fail(function (jqXHR) {
        let res = jqXHR.responseJSON || {};
        let msg = res.message || 'sign up error';
        self.alert(msg);
      });
    }

    createBoard(title, username) {
      const self = this;
      let data = {
        'title': title,
        'username': username
      };
      post(this.host + '/api/boards', data).done(function (board) {
        self.pageBoard(board.id);
      });
    }

    postComment(boardId, username, content) {
      const self = this;
      let data = {
        'username': username,
        'content': content
      };
      post(this.host + '/api/boards/' + boardId + '/comments', data).done(function (comment) {
        let data = {};
        data.board = {'id': comment.board_id};
        self.pageBoard(comment.board_id);
      });
    }

    page(component, data) {
      if (!data) {
        data = {};
      }
      data.login = {
        'username': sessionStorage.getItem('username'),
        'display_name': sessionStorage.getItem('display_name'),
        'token': sessionStorage.getItem('token')
      };
      this.header.html('');
      this.header.append(NavComponent(data));
      this.container.html('');
      this.container.append(component(data));
    }

    pageSign() {
      this.page(SignComponent, {});
    }

    pageBoardList() {
      const self = this;
      get(this.host + '/api/boards').done(function (boards) {
        let data = {'boardList': boards};
        self.page(BoardListComponent, data);
      });
    }

    pageBoard(boardId) {
      const self = this;
      get(self.host + '/api/boards/' + boardId + '/comments').done(function (board) {
        let data = {'board': board};
        self.page(BoardComponent, data);
      });
    }

    alert(message, level) {
      let data = {
        'message': message,
        'level': level || 'info'
      };
      this.container.prepend(AlertComponent(data));
    }
  }

  function init() {
    let controller = new Controller(host);
    post(host + '/login').done(function () {
      controller.pageBoardList();
    }).fail(function () {
      controller.pageSign();
    });
    return controller;
  }

  const controller = init();


  function AlertComponent(data) {
    let alertBody = $('<div>').addClass('alert alert-' + (data.level || 'info') + ' alert-dismissible').attr({'id': 'alert'});
    let btn = $('<button>').addClass('close').attr({'type': 'button', 'data-dismiss': 'alert', 'aria-label': 'Close'});
    let span = $('<span>').attr({'aria-hidden': 'true'}).html('&times;');
    let msg = $('<div>').text(data.message);

    alertBody.append(btn, msg);
    btn.append(span);
    return alertBody;
  }

  function NavComponent(data) {
    let nav = $('<nav>').addClass('navbar navbar-default navbar-fixed-top');
    let container = $('<div>').addClass('container-fluid');
    let navHeader = $('<div>').addClass('.navbar-header');
    navHeader.append($('<a>').addClass('navbar-brand').attr({'href': '/'}).text('Bulletin Board'));
    let collapse = $('<div>').addClass('collapse navbar-collapse');
    let navRight = $('<ul>').addClass('nav navbar-nav navbar-right');

    if (data.login.username && data.login.token) {
      let dropDown = $('<li>').addClass('dropdown');
      let dropHeader = $('<a>').addClass('dropdown-toggle').attr({
        'href': '',
        'data-toggle': 'dropdown',
        'role': 'button',
        'aria-haspopup': 'true',
        'aria-expanded': 'false'
      }).text('Signed in as ');
      dropHeader.append($('<strong>').text(data.login.display_name));
      dropHeader.append($('<span>').addClass('caret'));
      let menus = $('<ul>').addClass('dropdown-menu');
      let menu = $('<li>');
      let signOutMenu = $('<a>').attr({'href': ''}).text('Sign out');
      signOutMenu.on('click', function (e) {
        e.preventDefault();
        controller.logout();
      });
      navRight.append(dropDown);
      dropDown.append(dropHeader, menus);
      menus.append(menu);
      menu.append(signOutMenu);
    }
    nav.append(container);
    container.append(navHeader, collapse);
    collapse.append(navRight);

    return nav;
  }

  function SignComponent() {
    this.container = $('.container-fluid');
    let row = $('<div>').addClass('row');
    let col = $('<div>').addClass('col-sm-8 col-md-5 col-md-offset-3').attr({'id': 'sign'});
    let tabs = $('<ul>').addClass('nav nav-tabs nav-justified').attr({'id': '#sign-tabs'});
    let signInTab = $('<li>').addClass('active').attr({'role': 'presentation'});
    signInTab.append($('<a>').attr({
      'href': '#signin-panel',
      'aria-controls': 'signin-panel',
      'role': 'tab',
      'data-toggle': 'tab'
    }).text('Sign in'));
    let signUpTab = $('<li>').attr({'role': 'presentation'});
    signUpTab.append($('<a>').attr({
      'href': '#signup-panel',
      'aria-controls': 'signup-panel',
      'role': 'tab',
      'data-toggle': 'tab'
    }).text('Sign up'));

    let tabContent = $('<div>').addClass('tab-content').attr({'role': 'tabpanel'});
    let signInPanel = $('<div>').addClass('panel-body tab-pane active').attr({
      'id': 'signin-panel',
      'role': 'tabpanel'
    });
    let signInForm = $('<form>').attr({'id': 'signin-form'});
    let signInUser = $('<div>').addClass('form-group form-group-lg');
    signInUser.append($('<label>').addClass('control-label').attr({'for': 'login_field'}).text('Username'));
    signInUser.append($('<input>').addClass('form-control input-lg').attr({
      'id': 'login_field',
      'type': 'text',
      'placeholder': 'username',
      'name': 'username'
    }).text('Username'));
    let signInPassword = $('<div>').addClass('form-group');
    signInPassword.append($('<label>').addClass('control-label').attr({'for': 'password'}).text('Password'));
    signInPassword.append($('<input>').addClass('form-control input-lg').attr({
      'id': 'password',
      'type': 'password',
      'placeholder': 'password',
      'name': 'password'
    }));
    let signInBtn = $('<button>').addClass('btn btn-primary btn-lg btn-block').attr({
        'id': 'signin',
        'type': 'button'
      }
    ).text('Sign in');
    signInBtn.on('click', function () {
      let username = signInUser.find('input[name=username]').val();
      let password = signInPassword.find('input[name=password]').val();

      if (username.length === 0 || password.length === 0) {
        return controller.alert({'message': 'username and password can\'t be blank', 'level': 'warning'});
      }
      signInUser.find('input[name=username]').val('');
      signInPassword.find('input[name=password]').val('');

      controller.login(username, password);
    });

    let signUpPanel = $('<div>').addClass('panel-body tab-pane').attr({'id': 'signup-panel', 'role': 'tabpanel'});
    let signUpForm = $('<form>').attr({'id': 'signup-form'});
    let signUpUser = $('<div>').addClass('form-group form-group-lg');
    signUpUser.append($('<label>').addClass('control-label').attr({'for': 'inputUsername'}).text('Username'));
    signUpUser.append($('<input>').addClass('form-control input-lg').attr({
      'id': 'inputUsername',
      'type': 'text',
      'placeholder': 'username',
      'name': 'username'
    }).text('Username'));
    let signUpDisplayname = $('<div>').addClass('form-group form-group-lg');
    signUpDisplayname.append($('<label>').addClass('control-label').attr({'for': 'inputDisplayname'}).text('Displayname'));
    signUpDisplayname.append($('<input>').addClass('form-control input-lg').attr({
      'id': 'inputDisplayname',
      'type': 'text',
      'placeholder': 'username',
      'name': 'display_name'
    }).text('Displayname'));
    let signUpPassword = $('<div>').addClass('form-group');
    signUpPassword.append($('<label>').addClass('control-label').attr({'for': 'inputPassword'}).text('Password'));
    signUpPassword.append($('<input>').addClass('form-control input-lg').attr({
      'id': 'inputPassword',
      'type': 'password',
      'placeholder': 'password',
      'name': 'password'
    }));
    let signUpBtn = $('<button>').addClass('btn btn-primary btn-lg btn-block').attr({
        'id': 'signup',
        'type': 'button'
      }
    ).text('Sign up');
    signUpBtn.on('click', function () {
      let username = signUpUser.find('input[name=username]').val();
      let displayName = signUpDisplayname.find('input[name=display_name]').val();
      let password = signUpPassword.find('input[name=password]').val();

      if (username.length === 0 || displayName.length === 0 || password.length === 0) {
        return controller.alert({'message': 'username and password can\'t be blank', 'level': 'warning'});
      }
      signUpUser.find('input[name=username]').val('');
      signUpDisplayname.find('input[name=display_name]').val('');
      signUpPassword.find('input[name=password]').val('');

      controller.signUp(username, displayName, password);
    });

    row.append(col);
    col.append(tabs, tabContent);
    tabs.append(signInTab, signUpTab);
    tabContent.append(signInPanel, signUpPanel);
    signInPanel.append(signInForm);
    signInForm.append(signInUser, signInPassword, signInBtn);
    signUpPanel.append(signUpForm);
    signUpForm.append(signUpUser, signUpDisplayname, signUpPassword, signUpBtn);

    return row;
  }

  function BoardListComponent(data) {
    let boardList = $('<div>').attr({'id': 'board-list'});
    let row = $('<div>').addClass('row');
    let col = $('<div>').addClass('col-md-12');
    let panel = $('<div>').addClass('panel panel-default');
    let panelHead = $('<div>').addClass('panel-heading').text('Board List');
    let table = $('<table>').addClass('table table-hover');
    let thead = $('<thead>');
    let tr = $('<tr>');
    let tbody = $('<tbody>').attr('id', 'board-list');

    boardList.append(BoardCreateFormComponent(data), row);
    row.append(col);
    col.append(panel);
    panel.append(panelHead, table);
    table.append(thead, tbody);
    thead.append(tr);
    tr.append(
      $('<th>').text('#'),
      $('<th>').text('title'),
      $('<th>').text('creator'),
      $('<th>').text('created time'),
      $('<th>').text('updated time')
    );

    data.boardList.forEach(function (v, i) {
      let itemData = {};
      itemData.board = v;
      itemData.board.index = i + 1;
      tbody.append(BoardItemComponent(itemData));
    });

    return boardList;
  }

  function BoardCreateFormComponent(data) {
    let row = $('<div>').addClass('row');
    let col = $('<div>').addClass('col-md-8');
    let form = $('<form>').addClass('form-group input-group');
    let input = $('<input>').attr('placeholder', 'title').addClass('form-control col-md-4');
    let span = $('<span>').addClass('input-group-btn');
    let button = $('<button>').attr('type', 'button').addClass('btn btn-primary').text('Create');
    button.on('click', function () {
      let title = input.val();
      if (title.length === 0) {
        return;
      }
      input.val('');

      controller.createBoard(title, data.login.username);
    });

    row.append(col);
    col.append(form);
    form.append(input, span);
    span.append(button);

    return row;
  }

  function BoardItemComponent(data) {
    let boardItem = $("<tr>").addClass('board').attr({'scope': 'row', 'data-board-id': data.board.id});
    let index = $("<th>").text(data.board.index);
    let title = $("<th>").text(data.board.title);
    let creator = $("<td>").text(data.board.creator.display_name);
    let createdTime = $("<td>").text(data.board.created_at);
    let updatedTime = $("<td>").text(data.board.updated_at);
    boardItem.append(index, title, creator, createdTime, updatedTime);
    boardItem.on('click', function () {
      let id = $(this).attr('data-board-id');
      controller.pageBoard(id);
    });
    return boardItem;
  }

  function BoardComponent(data) {
    let board = $('<div>').attr({'id': 'board'});
    let title = $('<h1>').addClass('title').text(data.board.title);
    console.log(data);
    let small = $('<h4>');
    let subtitle = $('<small>').html(
      'Creator : <strong>' + data.board.creator.display_name + '</strong><br>' +
      'Created at: <strong>' + data.board.created_at + '</strong><br>' +
      'Last update: <strong>' + data.board.updated_at + '</strong>');

    let comments = $('<div>').attr({'id': 'comments'});
    let form = $('<form>').attr({'id': 'comment-form'});
    let textarea = $('<textarea>').addClass('form-control').attr({'rows': '3'});
    let btn = $('<button>').addClass('btn btn-default').attr({'type': 'button'}).text('Comment');
    btn.on('click', function () {
      let content = textarea.val();
      if (content.length === 0) {
        return;
      }
      textarea.val('');
      controller.postComment(data.board.id, data.login.username, content);
    });

    board.append(title, comments, form);
    title.append(small);
    small.append(subtitle)
    if (data.board.comments.length === 0) {
      controller.alert('No comment', 'info');
    } else {
      data.board.comments.forEach(function (v, i) {
        v.index = i + 1;
        comments.append(CommentItemComponent(v));
      });
    }

    form.append(textarea, btn);

    return board;
  }

  function CommentItemComponent(data) {
    let comment = $('<div>').addClass('panel panel-default comment-panel');
    console.log(data.head);
    let header = $('<div>').addClass('panel-heading').text(data.index + '. ' + data.creator.display_name + ': ' + data.created_at);
    let body = $('<div>').addClass('panel-body').text(data.content);
    comment.append(header, body);
    return comment;
  }

}

let HOST = 'http://' + location.hostname + ':3000';
main(HOST);
