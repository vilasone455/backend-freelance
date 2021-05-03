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
const express_1 = require("express");
const User_1 = require("../entity/User");
const UserNotFoundException_1 = require("../exceptions/UserNotFoundException");
const typeorm_1 = require("typeorm");
class UserController {
    constructor() {
        this.path = '/users';
        this.router = express_1.Router();
        this.userRespotity = typeorm_1.getRepository(User_1.User);
        this.getAllJob = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const users = yield this.userRespotity.find({ relations: ["jobPosts"] });
            response.send(users);
        });
        this.getAllUser = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const users = yield this.userRespotity.find({ relations: ["profile", "profile.address", "profile.generalProfile", "profile.workExs", "profile.portfilios"] });
            response.send(users);
        });
        this.getUserById = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const user = yield this.userRespotity.findOne({ relations: ["profile", "profile.address", "profile.generalProfile", "profile.workExs", "profile.portfilios"], where: {
                    id: Number(id)
                } });
            if (user) {
                response.send(user);
            }
            else {
                next(new UserNotFoundException_1.default(id));
            }
        });
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}/:id`, this.getUserById);
        this.router.get(`${this.path}`, this.getAllUser);
        this.router.get(`${this.path}/jobs`, this.getAllJob);
    }
}
exports.default = UserController;
//# sourceMappingURL=UserController.js.map