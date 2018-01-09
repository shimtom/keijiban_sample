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
  let token = sessionStorage.token;
  let username = sessionStorage.username;
  console.log('token', token);
  console.log('username', username);
  if (token) {
    return post(host + '/validate').done(function () {
      page(BoardListComponent());
    }).fail(function () {
      page(SignComponent());
    });
  }
  page(SignComponent());
}

function login(username, password) {
  let user = {
    'username': username,
    'password': password
  };
  post(host + '/login', user).done(function (res) {
    console.log('Success POST /login');
    let username = res.username;
    let token = res.token;
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('token', token);
    page(BoardListComponent);
  }).fail(function (jqXHR) {
    let res = jqXHR.responseJSON || {};
    let msg = res.message || 'sign in error';
    showAlert(msg);
  });
}

function page(component) {
  let data = {
    'username': sessionStorage.getItem('username'),
    'token': sessionStorage.getItem('token')
  };
  $('header').append(NavComponent(data));
  $('.container-fluid#board').append(component(data));
}

function showAlert(text) {
  $('.container-fluid').prepend(AlertComponent({'message': text}));
}

function AlertComponent(data) {
  let alertBody = $('<div>').addClass('alert alert-danger alert-dismissible').attr({'id': 'alert'});
  let btn = $('<button>').addClass('close').attr({'type': 'button', 'data-dismiss': 'alert', 'aria-label': 'Close'});
  let span = $('<span>').attr({'aria-hidden': 'true'}).text('&times;');
  let msg = $('<div>').text(data.message);

  alertBody.append(btn, msg);
  btn.append(span);
  return alertBody;
}

function NavComponent(data) {
  let header = $('<header>');
  let nav = $('<nav>').addClass('navbar navbar-default navbar-fixed-top');
  let container = $('<div>').addClass('container-fluid');
  let navHeader = $('<div>').addClass('.navbar-header');
  navHeader.append($('<a>').addClass('navbar-brand').attr({'href': '/'}).text('Bulletin Board'));
  let collapse = $('<div>').addClass('collapse navbar-collapse');
  let navRight = $('<ul>').addClass('nav navbar-nav navbar-right');

  if (data.username && data.token) {
    let dropDown = $('<li>').addClass('dropdown');
    let dropHeader = $('<a>').addClass('dropdown-toggle').attr({
      'href': '',
      'data-toggle': 'dropdown',
      'role': 'button',
      'aria-haspopup': 'true',
      'aria-expanded': 'false'
    }).text('Signed in as ');
    dropHeader.append($('<strong>').text(data.username));
    dropHeader.append($('<span>')).addClass('caret');
    let menus = $('<ul>').addClass('dropdown-menu');
    let menu = $('<li>');
    let signoutMenu = $('<a>').attr({'href': ''}).text('Sign out');
    signoutMenu.on('click', function (e) {
      e.preventDefault();
      get(host + '/logout').done(function () {
        sessionStorage.clear();
        signComponent();
      })
    }).fail(function () {
      showAlert('fail to sign out');
    });
    navRight.append(dropDown);
    dropDown.append(dropHeader, menus);
    menus.append(menu);
    menu.append(signoutMenu);
  }
  header.append(nav);
  nav.append(container);
  container.append(navHeader, collapse);
  collapse.append(navRight);

  return header;
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
  let signInPanel = $('<div>').addClass('panel-body tab-pane active').attr({'id': 'signin-panel', 'role': 'tabpanel'});
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
      return showAlert('username and password can\'t be blank');
    }
    signInUser.find('input[name=username]').val('');
    signInPassword.find('input[name=password]').val('');

    login(username, password);
    let user = {
      'username': username,
      'password': password
    };
  });

  let signUpPanel = $('<div>').addClass('panel-body tab-pane active').attr({'id': 'signin-panel', 'role': 'tabpanel'});
  let signUpForm = $('<form>').attr({'id': 'signin-form'});
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
    let displayname = signUpDisplayname.find('input[name=display_name]').val();
    let password = signUpPassword.find('input[name=password]').val();

    if (username.length === 0 || password.length === 0) {
      return showAlert('username and password can\'t be blank');
    }
    signUpUser.find('input[name=username]').val('');
    signUpDisplayname.find('input[name=display_name]').val('');
    signUpPassword.find('input[name=password]').val('');

    let user = {
      'username': username,
      'display_name': displayname,
      'password': password
    };

    post(host + '/api/users', user).done(function () {
      login(username, password);
    }).fail(function (jqXHR) {
      let res = jqXHR.responseJSON || {};
      let msg = res.message || 'sign up error';
      showAlert(msg);
    });
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
  let panelHead = $('<dib>').addClass('.panel-heading').text('Board List');
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

  $.ajax(host + '/api/boards', {
    type: 'GET'
  }).done(function (data) {
    data.forEach(function (v, i) {
      boardListBody.append(boardItme(v.id, i, v.title, v.creator.display_name, v.created_at, v.updated_at));
    });
  });

  get(host + '/api/boards').done(function (res) {
    res.forEach(function (v, i) {
      let itemData = Object.assign({}, data);
      itemData.boardId = v.id;
      itemData.index = i + 1;
      itemData.title = v.title;
      itemData.creatorName = v.creator.display_name;
      itemData.createdAt = v.created_at;
      itemData.updatedAt = v.updated_at;
      tbody.append(BoardItemComponent(itemData));
    });
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
    let board = {
      "title": title,
      "username": data.username
    };
    post(host + '/api/boards', board).done(function (res) {
      data.boardId = res.id;
      data.title = res.title;
      data.creatorName = res.creator.display_name;
      data.createdAt = res.created_at;
      data.updatedAt = res.updated_at;
      page(BoardComponent(data));
    });
  });

  row.append(col);
  col.append(form);
  form.append(input, span);
  span.append(button);

  return row;
}

function BoardItemComponent(data) {
  let boardItem = $("<tr>").addClass('board').attr({'scope': 'row', 'data-board-id': data.boardId});
  let index = $("<th>").text(data.index);
  let title = $("<th>").text(data.title);
  let creator = $("<td>").text(data.displayName);
  let createdTime = $("<td>").text(data.createdAt);
  let updatedTime = $("<td>").text(data.updatedAt);
  boardItem.append(index, title, creator, createdTime, updatedTime);
  boardItem.on('click', function () {
    let id = $(this).attr('data-board-id');
    get(host + '/api/boards/' + id).done(function (res) {
      data.boardId = res.id;
      data.title = res.title;
      data.creatorName = res.creator.display_name;
      data.createdAt = res.created_at;
      data.updatedAt = res.updated_at;
      page(BoardComponent(data));
    });
  });
  return boardItem;
}

function BoardComponent(data) {
  let board = $('<div>').attr({'id': 'board'});
  let title = $('<h1>').addClass('title').text(data.title);
  let comments = $('<div>').attr({'id': 'comments'});
  let form = $('<form>').attr({'id': 'comment-form'});
  let textarea = $('<textarea>').addClass('form-control').attr({'rows': '3'});
  let btn = $('<button>').addClass('btn btn-default').attr({'type': 'button'}).text('Comment');
  btn.on('click', function () {
    console.log('post comment');
    // comment form の値を取得
    let content = textarea.val();
    if (content.length === 0) {
      return;
    }
    textarea.val('');
    let comment = {'content': content, 'username': data.username};

    post(host + '/api/boards/' + data.boardId + '/comments', comment).done(function (res) {
      comments.append(CommentItemComponent(res));
    });
  });

  board.append(title, comments, form);
  data.comments.forEach(function (v) {
    comments.append(CommentItemComponent(v));
  });
  form.append(textarea, btn);

  return board;
}

function CommentItemComponent(data) {
  let comment = $('<div>').addClass('panel panel-default comment-panel');
  let header = $('<div>').addClass('panel-heading').text(data.index + '. ' + data.displayName + ': ' + data.createdAt);
  let body = $('<div>').addClass('panel-body').text(data.content);
  comment.append(header, body);
  return comment;
}

let HOST = "http://127.0.0.1:3000";
main(HOST);
