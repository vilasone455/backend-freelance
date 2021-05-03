"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const express = require("express");
const bodyParser = require("body-parser");
const UserController_1 = require("./controller/UserController");
const authentication_controller_1 = require("./authentication/authentication.controller");
const ProfileController_1 = require("./controller/ProfileController");
const JobPostController_1 = require("./controller/JobPostController");
const cors = require("cors");
typeorm_1.createConnection().then((connection) => __awaiter(void 0, void 0, void 0, function* () {
    const app = express();
    app.use(cors);
    app.use(bodyParser.json());
    console.log(process.env.PORT);
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
})).catch(error => console.log("TypeORM connection error: ", error));
//# sourceMappingURL=index.js.map