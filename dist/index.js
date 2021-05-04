"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const express = require("express");
const bodyParser = require("body-parser");
const UserController_1 = require("./controller/UserController");
const authentication_controller_1 = require("./authentication/authentication.controller");
const ProfileController_1 = require("./controller/ProfileController");
const JobPostController_1 = require("./controller/JobPostController");
require("./initenv");
const config = {
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
};
typeorm_1.createConnection(config).then(async (connection) => {
    const app = express();
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods: GET, POST, "PUT" , OPTIONS');
        res.header("Access-Control-Allow-Headers", "x-requested-with, content-type");
        res.header("Access-Control-Allow-Credentials", "true");
        if ('OPTIONS' == req.method) {
            res.send(200);
        }
        else {
            next();
        }
    });
    app.use(bodyParser.json());
    let controllers = [
        new UserController_1.default(),
        new authentication_controller_1.default(),
        new ProfileController_1.default(),
        new JobPostController_1.default()
    ];
    controllers.forEach((controller) => {
        app.use('/', controller.router);
    });
    app.listen(3000);
    console.log("Express application is up and running on port 3000");
}).catch(error => console.log("TypeORM connection error: ", error));
//# sourceMappingURL=index.js.map