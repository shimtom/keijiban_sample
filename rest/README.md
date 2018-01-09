# REST API

## Methods


| Method               | Type   | api                              |
|:---------------------|:-------|:---------------------------------|
| log in               | `POST` | `/login`                         |
| log out              | `GET`  | `/logout`                        |
| Get all users        | `GET`  | `/api/users`                     |
| Register new user    | `POST` | `/api/users`                     |
| Get a single user    | `GET`  | `/api/users/:username`           |
| List users's boards  | `GET`  | `/api/users/:username/boards`    |
| List all boards      | `GET`  | `/api/boards`                    |
| Create new board     | `POST` | `/api/boards`                    |
| Get a single board   | `GET`  | `/api/boards/:board_id`          |
| Get board's comments | `GET`  | `/api/boards/:board_id/comments` |
| Post a comment       | `POST` | `/api/boards/:board_id/comments` |


### Log in
```
POST /login
```

#### Input
| Input      | type     | Description |
|:-----------|:---------|:------------|
| `username` | `string` | ユーザー名  |
| `password` | `string` | パスワード  |

#### Example
```json
{
  "username": "your username",
  "password": "password"
}
```
#### Response
```
Status: 200 Success
```

```json
{
  "username": "your username",
  "display_name": "display name",
  "token": "JIW token"
}
```
トークンは`Authorization`ヘッダに`bearer token`の形式で付与することで,認証の必要なapiを使用することができます.

### Log out
```
GET /logout
```

#### Response
```
Status: 200 Success
```

```json
{
  "username": "your username",
  "display_name": "display name"
}
```

### Get all users
```
GET /api/users
```

#### Response
```
Status: 200 Success
```

```json
[
  {
    "username": "username",
    "display_name": "display name"
  }
]
```


### Register user
```
POST /api/users
```

#### Input

| Name           | Type     | Description                                  |
|:---------------|:---------|:---------------------------------------------|
| `username`     | `string` | ユーザー名                                   |
| `display_name` | `string` | 表示されるユーザー名                         |
| `password`     | `string` | ユーザーのパスワード                         |

#### Example
```json
{
  "username": "your username",
  "display_name": "display name",
  "password": "password"
}
```

#### Response
```
Status: 201 Created.
```

```json
{
  "username": "your username",
  "display_name": "display name"
}
```

###  Get a single user

```
GET /api/users/:username
```

#### Response
```
Status: 200 Success
```

```json
{
  "username": "username",
  "display_name": "display name"
}
```

### List user's boards
```
Get /api/users/:username/boards
```
### Response
```
Status: 200 Success
```

```json
[
  {
    "id": 1234,
    "title": "board title",
    "creator": {
      "username": "username",
      "display_name": "display name"
    },
    "created_at": "2011-04-10T20:09:31.000Z",
    "updated_at": "2014-03-03T18:58:10.000Z"
  }
]
```


### List all boards
```
Get /api/boards
```

### Response
```
Status: 200 Success
```

```json
[
  {
    "id": 1234,
    "title": "board title",
    "creator": {
      "username": "username",
      "display_name": "display name"
    },
    "created_at": "2011-04-10T20:09:31.000Z",
    "updated_at": "2014-03-03T18:58:10.000Z"
  }
]
```


### Creat a board
```
POST /api/boards
```

#### Input
| Input      | type     | Description              |
|:-----------|:---------|:-------------------------|
| `title`    | `string` | ボードのタイトル         |
| `username` | `string` | ボード作成者のユーザー名 |

#### Example
```json
{
  "title": "board title",
  "username": "username"
}
```

#### Response
```
Status: 201 OK
```

```json
{
  "id": 1234,
  "title": "board title",
  "creator": {
    "username": "username",
    "display_name": "display name"
  },
  "created_at": "2011-04-10T20:09:31.000Z",
  "updated_at": "2011-04-10T20:09:31.000Z"
}
```

### Get a single board
```
GET /api/boards/:board_id
```

#### Response
```
Status: 200 Success
```

```json
{
  "id": 1234,
  "title": "board title",
  "creator": {
    "username": "username",
    "display_name": "display name"
  },
  "created_at": "2011-04-10T20:09:31.000Z",
  "updated_at": "2014-03-03T18:58:10.000Z"
}
```

### Get board's comments
```
GET /api/boards/:board_id/comments
```

### Response
```
Status: 200 Success
```

```json
{
  "id": 1234,
  "title": "board title",
  "creator": {
    "username": "username",
    "display_name": "display name"
  },
  "created_at": "2011-04-10T20:09:31.000Z",
  "updated_at": "2014-03-03T18:58:10.000Z",
  "comments": [
      {
        "id": 1,
        "board_id": 1234,
        "content": "this is comment",
        "creator": {
          "username": "username",
          "display_name": "display name"
        },
        "created_at": "2011-04-10T20:09:31.000Z",
        "updated_at": "2014-03-03T18:58:10.000Z"
      }  
  ]
}
```


### Post comment
```
POST /api/boards/:board_id/comments
```

#### Input
| Input      | type     | Description                        |
|:-----------|:---------|:-----------------------------------|
| `content`  | `string` | コメントの内容                     |
| `username` | `string` | コメントを行うユーザーのユーザー名 |

#### Example
```json
{
  "content": "this is comment.",
  "username": "username"
}
```

#### Response
```
Status: 201 Created
```

```json
{
  "id": 1,
  "board_id": 123,
  "content": "this is comment.",
  "creator": {
    "username": "username",
    "display_name": "display name"
  },
  "created_at": "2011-04-10T20:09:31.000Z",
  "updated_at": "2011-04-10T20:09:31.000Z"
}
```
