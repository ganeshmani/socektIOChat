# SOCKET IO CHAT APPLICATION
### SocketChatMEANApplication
---
### Description
it is a socket chat application for group or one-one.it is a ExpressJS application to chat for group or one-one. 
## Screeshot
![Screenshot](https://github.com/ganeshmani/socektIOChat/blob/master/chatscreen.png)
![Screenshot2](https://github.com/ganeshmani/socektIOChat/blob/master/loginscreen.png)
![Screenshot3](https://github.com/ganeshmani/socektIOChat/blob/master/signupscreen.png)
---
## Prerequistics
* NodeJS
* MongoDB
* NPM
* Git
* Express
* nginx
---
## Installation guides
Download NodeJS - https://nodejs.org/en/download/
.MonogDB - https://www.mongodb.com/download-center
.nginx - In Linux Type Command Like `sudo apt-get install nginx`
After installing nginx - host the server in nginx like.
```
$ cd /etc/nginx/sites-enabled
$ sudo nano default

 server { 
     listen 80;
     root <your file path>;
     index app.js index.html;
     location /{
       proxy_pass http://localhost:3000/users;
     }
    }
```    

Install the node and mongodb.Download the Zip file from git and run the file
Goto the directory in the terminal and execute command `node app.js`.
Following are console outputs 
```
node app.js
app is listening to port 3000
database is connected successfully
```
now,you can run in URL-http://localhost:3000/users
---
## Demo
Goto - http://ec2-13-58-234-143.us-east-2.compute.amazonaws.com 
---
## Editors & IDE
* OS-Linux UBUNTU 16.04
* Atom
* Compass for MongoDB-GUI
---
## Version
v1.0
---
## MyProfile
[my-profile](https://github.com/ganeshmani)
---
