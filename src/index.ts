
import {createConnection, getRepository} from "typeorm";

import * as express from "express";
import * as bodyParser from "body-parser";

import Controller from './interfaces/controller.interface';
import UserController from './controller/UserController'
import AuthenticationController from "./authentication/authentication.controller";
import ProfileController from "./controller/ProfileController";
import JobPostController from "./controller/JobPostController";

import CategoryController from "./controller/CategoryController";
import "./initenv"
import TestController from "./controller/TestController";
import ProposalController from "./controller/ProposalController";
import OrderController from "./controller/OrderController";
import ReviewController from "./controller/ReviewController";
import ReportController from "./controller/ReportController";
import MessageController from "./controller/MessageController";
import PaymentController from "./controller/PaymentController";
import FileListController from "./controller/FileListController";

import CloundFileController from "./controller/CloundFileController";
import {v2} from 'cloudinary'
import NoficationController from "./controller/NoficationController";
import BanJob from './cronjob/BanJob';
import socketio   from 'socket.io';
import WebSocket from './socket/WebSocket'
import ChatController from "./controller/ChatController";
import * as jwt from 'jsonwebtoken';
import DataStoredInToken from "./interfaces/dataStoredInToken";
import { UserSocket } from "./interfaces/UserSocket";
import { AddChat } from "./interfaces/AddChat";

const config : any = {
    "name": "default",
    "type": "postgres",
    "url": process.env.DATABASE_URL,
    "synchronize": true,
    "entities": [
      "dist/entity/*.js"
    ],
    "subscribers": [
      "dist/subscriber/*.js"
    ],
    "migrations": [
      "dist/migration/*.js"
    ],
    "cli": {
      "entitiesDir": "src/entity",
      "migrationsDir": "src/migration",
      "subscribersDir": "src/subscriber"
    }
}

createConnection(config).then(async connection => {

    const app = express();

    app.use(function( req, res, next ) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header("Access-Control-Allow-Headers", "x-requested-with, content-type , authorization" );
        res.header("Access-Control-Allow-Credentials", "true");
        if ('OPTIONS' == req.method) { res.send(200); } else { next(); } 
    });

    v2.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET
    });

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({extended: true}))

    let controllers : Controller[] = [
        new UserController(),
        new AuthenticationController(),
        new ProfileController(),
        new JobPostController(),
        new CategoryController(),
        new ProposalController(),
        new TestController(),
        new OrderController(),
        new ReviewController(),
        new ReportController(),
        new MessageController(),
        new PaymentController(),
        new FileListController(),
        new CloundFileController(),
        new NoficationController(),
        new ChatController()
    ]
    
    controllers.forEach((controller) => {
        app.use('/', controller.router);
    });

    console.log("port : " + process.env.PORT)
 

    const httpServer = require("http").createServer(app);
    const options = { cors: {
      origin: "http://localhost:8000",
    }, };
    const io = require("socket.io")(httpServer, options);

    io.use((socket, next) => {
      console.log("start connect")
      const token = socket.handshake.auth.token
      console.log("get connection auth : " + token)
      if (token){
        const secret = process.env.SECRET_KEY;
        jwt.verify(token, secret , function(err, decoded : DataStoredInToken) {
          if (err) return next(new Error('Authentication error'));
          console.log("new user : " + decoded._id)
          socket.user_id  =  decoded._id;;
          next();
        });
      }
      else {
        next(new Error('Authentication error'));
      }    
    });

    io.on('connection', function(socket) {
      const users : UserSocket[]= [];
      console.log('A user connected');
      //socket.emit("newuser", {userId : socket.user_id});
      for (let [id, socket] of io.of("/").sockets) {
        users.push({
          socketId: id,
          userId: socket.user_id,
        });
      }
      console.log(users)
      socket.emit("users", users);
 
      socket.on('disconnect', function () {
         console.log('A user disconnected ' + socket.id);
         let indexof = users.findIndex(u=>u.socketId === socket.id)
         if(indexof !== -1) {
          socket.emit("leaveuser" , {userId : users[indexof].userId})
          users.splice(indexof, 1);
          console.log("remove user " + indexof)
         }
      });
      socket.on("message", (data : AddChat) => {
        console.log("get message send to user id : " + data.recipient + " msg :" + data.msg)
        console.log(users)
        let sId = users.find(u=>u.userId === data.recipient)
        if(sId){
          console.log("found user : " + sId.userId + " socket : " + sId.socketId)
          socket.to(sId.socketId).emit("message", data);
        }
        
      });
    });

    httpServer.listen(process.env.PORT || 3000 , () => {
      BanJob.checkBanUser()
    });

    app.on('close', () => {
      app.removeAllListeners();
    });

    console.log("Express application is up and running on port 3000");
}).catch(error => console.log("TypeORM connection error: ", error));
