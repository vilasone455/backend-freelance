import "reflect-metadata";
import {createConnection} from "typeorm";
import {Request, Response} from "express";
import * as express from "express";
import * as bodyParser from "body-parser";
import {AppRoutes} from "./routes";
import Controller from './interfaces/controller.interface';
import UserController from './controller/UserController'
import AuthenticationController from "./authentication/authentication.controller";
import ProfileController from "./controller/ProfileController";

// create connection with database
// note that it's not active database connection
// TypeORM creates connection pools and uses them for your requests
createConnection().then(async connection => {

    // create express app
    const app = express();
    app.use(bodyParser.json());

    let controllers : Controller[] = [
        new UserController(),
        new AuthenticationController(),
        new ProfileController()
    ]
    
    controllers.forEach((controller) => {
        app.use('/', controller.router);
    });

    // run app
    app.listen(3000);

    console.log("Express application is up and running on port 3000");

}).catch(error => console.log("TypeORM connection error: ", error));
