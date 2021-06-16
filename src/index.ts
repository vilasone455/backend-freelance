
import {createConnection} from "typeorm";

import * as express from "express";
import * as bodyParser from "body-parser";

import Controller from './interfaces/controller.interface';
import UserController from './controller/UserController'
import AuthenticationController from "./authentication/authentication.controller";
import ProfileController from "./controller/ProfileController";
import JobPostController from "./controller/JobPostController";
import ServiceController from "./controller/ServiceController";
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

    app.use(bodyParser.json());

    let controllers : Controller[] = [
        new UserController(),
        new AuthenticationController(),
        new ProfileController(),
        new JobPostController(),
        new ServiceController(),
        new CategoryController(),
        new ProposalController(),
        new TestController(),
        new OrderController(),
        new ReviewController(),
        new ReportController(),
        new MessageController(),
        new PaymentController(),
        new FileListController()
    ]
    
    controllers.forEach((controller) => {
        app.use('/', controller.router);
    });
    app.listen(process.env.PORT || 3000);
    console.log("Express application is up and running on port 3000");
}).catch(error => console.log("TypeORM connection error: ", error));
