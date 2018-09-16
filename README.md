# Saftladen Dashboard

## Repo Structure

### API-Server

_(lives on the raspberry pi)_

Node Server based on fastify and graphql.

- Provides access to the Database.
- Performs crawling tasks for whatever we tell it to (twitter followers, steam active players, internal api-calls).
- Provides authorisation via Slack

### DB

_(lives on the raspberry pi)_

Postgres 9.6 DB

### Web Interface

_(deployed as flat files, living somewhere in the cloud.)_

Two Parts:

#### Dashboard

- Publicly accessible via dashboard.saftladen.berlin.
- Authorised people will be able to see all information, non-authorised people only public information
- Based on a 4x3 grid.
- Various content types: Images, Videos, Countdowns, Slack-Channel-integration, Charts
- Each element gets a placement-score including a decay-value. So different elements can have different characteristics: low score - no decay, medium score - slowly decreasing, massive score - quickly decreasing.
- The higher an element's placement score, the bigger the element on the dashboard (e.g. a countdown will have a massive score while it's counting, potentially displacing some low-score elements.)
- A placement algorithm dynamically places and sizes elements in the grid on the dashboard based on their current scores

#### Admin Interface

- Accessible via dashboard.saftladen.berlin/admin for logged in members (authorisation via the Saftladen Slack account)
- People will be able to create and manage all kinds of elements and assign their score characteristcs and whether it's public information or not.
- Dedicated section to setup web-crawler tasks. You can define url, headers, parameters, etc and the api will regularly call this endpoint. (E.g. steam api, google analytics, twitter api). Based on that information we'll be able to create time series for all (numerical) data and display it.

## Deployment

### Prerequisites

- node 8 or newer
- yarn

### API

- ensure `api/.env.production` is present (check `api/.env.sample` for shape)
- `cd api && yarn install && yarn deploy`

### Frontend

- ensure `web-app/.env.deploy-prod` is present (check `web-app/.env.deploy-prod.sample` for shape)
- `cd web-app && yarn deploy`

### DB Migrations

tba

## Setup on Raspberry Pi with debian stretch

### Database

```bash
sudo apt-get update
sudo apt-get install postgresql-9.6
sudo su - postgres
echo "CREATE ROLE saftuser superuser login; CREATE DATABASE saftboard OWNER=saftuser;" | psql
psql
# > ALTER USER saftuser WITH PASSWORD '[PW]';
```

You can now connect to the db via a ssh tunnel which most DB clients should offer.

The data then needs to be transferred manually.

### Api Server

#### Firewall

```bash
sudo apt-get update && sudo apt-get install ufw
sudo ufw allow ssh/tcp
sudo ufw allow 80/tcp
sudo ufw enable
```

#### ngnix

```bash
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install nginx
sudo apt-get install vim
sudo vi /etc/nginx/sites-enabled/default
# comment out the first two "listen" statements
sudo vi /etc/nginx/conf.d/saftboardapi.conf
# changes below
sudo service nginx restart
```

`/etc/nginx/conf.d/saftboardapi.conf`:

```conf
server {
  listen      80 default_server;
  server_name _;

  location /subscriptions {
      proxy_pass http://localhost:9393;
      # this magic is needed for WebSocket
      proxy_http_version  1.1;
      proxy_set_header    Upgrade $http_upgrade;
      proxy_set_header    Connection "upgrade";
      proxy_set_header    Host $http_host;
      proxy_set_header    X-Real-IP $remote_addr;
      proxy_read_timeout  86400;
  }

  location / {
    proxy_set_header  X-Real-IP  $remote_addr;
    proxy_set_header  Host       $http_host;
    proxy_pass        http://127.0.0.1:9393;
  }

  access_log off;
  gzip on;
  gzip_proxied any;
  gzip_comp_level    5;
  gzip_min_length    256;
  gzip_types  application/json application/javascript text/plain;
}
```

#### Node & Yarn

```bash
sudo apt-get install -y build-essential
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn

sudo npm i -g pm2
```

#### New user

```bash
sudo adduser saftboardapi --disabled-password
sudo su saftboardapi
cd ~
mkdir .ssh
chmod 0700 .ssh
vi .ssh/authorized_keys # add your ssh key
chmod 0600 .ssh/authorized_keys
mkdir api
# deploy into api folder
pm2 start ecosystem.json
pm2 save
```

as root user execute `pm2 startup` and adapt the returned command to the user above
I.e. something like: `sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u saftboardapi --hp /home/saftboardapi`
