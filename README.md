# nginxhost

![GitHub package.json version](https://img.shields.io/github/package-json/v/kenblikylee/nginxhost)
![npm weekly download](https://img.shields.io/npm/dw/nginxhost)
[![license](https://img.shields.io/github/license/kenblikylee/nginxhost)](https://github.com/kenblikylee/nginxhost/blob/master/LICENSE)

automatically generate nginx-vhosts file for nodejs project.

## installation

``` sh
$ npm i -g nginxhost
```

## usage

### 非 nodejs 项目目录(无 package.json)

``` sh
$ nginxhost
init nginxhost in ./nginxhost.json
server {
    listen 80;
    
    server_name www.myapp.com myapp.com;
    root /var/www/myapp;
    index index.html index.htm;
}
```

`nginxhost.json`:

``` json
{
    "listen": 80,
    "ssl": false,
    "sslConfig": {
        "pem": "myapp",
        "key": "myapp"
    },
    "server_name": "www.myapp.com myapp.com",
    "root": "/var/www/myapp",
    "index": "index.html index.htm",
    "locations": [],
    "staticCached": false,
    "php": false
}
```



### nodejs 项目目录(有 package.json)

``` sh
$ mkdir awesome_app && cd awesome_app
$ npm init -y
$ nginxhost
init nginxhost in ./package.json
server {
    listen 80;
    
    server_name www.awesome_app.com awesome_app.com;
    root /var/www/awesome_app;
    index index.html index.htm;
}
```

`package.json`:

``` json
{
    "name": "awesome_app",
    ...
    "nginxhost": {
        "listen": 80,
        "ssl": false,
        "sslConfig": {
            "pem": "awesome_app",
            "key": "awesome_app"
        },
        "server_name": "www.awesome_app.com awesome_app.com",
        "root": "/var/www/awesome_app",
        "index": "index.html index.htm",
        "locations": [],
        "staticCached": false,
        "php": false
    }
}
```

### vhost

`nginxhost` 运行成功，会显示 `nginx` 虚拟机配置信息，同时保存到当前目录下的 `vhost` 文件中。在文件 `./nginxhost.json` 或 `package.json` 修改配置，重新运行 `nginxhost` 可重新生成新的 `vhost` 文件。

例如将配置字段`ssl`, `staticCached`, `php`都设置为 `true`，生成 `vhost` 内容如下：

```
server {
    listen 80;
    listen 443 ssl;
    server_name www.myapp.com myapp.com;
    root /var/www/myapp;
    index index.php Index.php index.html index.htm;
    
    ssl_certificate   cert/myapp.pem;
    ssl_certificate_key  cert/myapp.key;
    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;
    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    
    location ~ .*\.(js|css|gif|jpg|jpeg|png|woff|woff2|eot|otf|ttf)$ {
      add_header Expires "Mon, 15 Apr 2028 23:00:00 GMT";
      add_header Cache-Control "max-age=315360000";
    }
    location ~ \.php$ {
      include       fastcgi_params;
      fastcgi_pass  127.0.0.1:9000;
      fastcgi_index index.php;
    }
}
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019 kenblikylee
