
import {createConnection} from "typeorm";
import {Request, Response} from "express";
import * as express from "express";
import * as bodyParser from "body-parser";
import {AppRoutes} from "./routes";
import Controller from './interfaces/controller.interface';
import UserController from './controller/UserController'
import AuthenticationController from "./authentication/authentication.controller";
import ProfileController from "./controller/ProfileController";
import JobPostController from "./controller/JobPostController";
import * as cors from "cors";

// create connection with database
// note that it's not active database connection
// TypeORM creates connection pools and uses them for your requests

createConnection().then(async connection => {
    // create express app
    const app = express();

    app.use(function( req, res, next ) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods: GET, POST, "PUT" , OPTIONS');
        res.header("Access-Control-Allow-Headers", "x-requested-with, content-type");
        res.header("Access-Control-Allow-Credentials", "true");
        if ('OPTIONS' == req.method) { res.send(200); } else { next(); } 
    });

    app.use(bodyParser.json());



    console.log(process.env.PORT)

    let controllers : Controller[] = [
        new UserController(),
        new AuthenticationController(),
        new ProfileController(),
        new JobPostController()
    ]
    
    controllers.forEach((controller) => {
        app.use('/', controller.router);
    });
    app.listen(3000);
    console.log("Express application is up and running on port 3000");
}).catch(error => console.log("TypeORM connection error: ", error));
