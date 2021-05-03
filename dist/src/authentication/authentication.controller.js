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
const bcrypt = require("bcrypt");
const express_1 = require("express");
const jwt = require("jsonwebtoken");
const WrongCredentialsException_1 = require("../exceptions/WrongCredentialsException");
const validation_middleware_1 = require("../middleware/validation.middleware");
const User_1 = require("../entity/User");
const CreateUser_dto_1 = require("../dto/CreateUser.dto");
const authentication_service_1 = require("./authentication.service");
const typeorm_1 = require("typeorm");
const env_1 = require("../../env");
class AuthenticationController {
    constructor() {
        this.path = '/auth';
        this.router = express_1.Router();
        this.authenticationService = new authentication_service_1.default();
        this.userResposity = typeorm_1.getRepository(User_1.User);
        this.registration = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const userData = request.body;
            try {
                const { cookie, user, } = yield this.authenticationService.register(userData);
                response.setHeader('Set-Cookie', [cookie]);
                response.send(user);
            }
            catch (error) {
                next(error);
            }
        });
        this.loggingIn = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const logInData = request.body;
            const user = yield this.userResposity.findOne({ userEmail: logInData.userEmail });
            console.log("start login");
            if (user) {
                console.log("have user");
                const isPasswordMatching = yield bcrypt.compare(logInData.userPassword, user.userPassword);
                console.log(isPasswordMatching);
                if (isPasswordMatching) {
                    const tokenData = this.createToken(user);
                    response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
                    response.send(user);
                }
                else {
                    next(new WrongCredentialsException_1.default());
                }
            }
            else {
                next(new WrongCredentialsException_1.default());
            }
        });
        this.loggingOut = (request, response) => {
            response.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
            response.send(200);
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post(`${this.path}/register`, validation_middleware_1.default(CreateUser_dto_1.CreateUserDto), this.registration);
        this.router.post(`${this.path}/login`, this.loggingIn);
        this.router.post(`${this.path}/logout`, this.loggingOut);
    }
    createCookie(tokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }
    createToken(user) {
        const expiresIn = 60 * 60;
        const secret = env_1.secretKey;
        const dataStoredInToken = {
            _id: user.id,
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
        };
    }
}
exports.default = AuthenticationController;
//# sourceMappingURL=authentication.controller.js.map