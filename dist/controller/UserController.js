"use strict";
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
        this.getAllJob = async (request, response, next) => {
            const users = await this.userRespotity.find({ relations: ["jobPosts"] });
            response.send(users);
        };
        this.getAllUser = async (request, response, next) => {
            const users = await this.userRespotity.find({ relations: ["profile", "profile.address", "profile.generalProfile", "profile.workExs", "profile.portfilios"] });
            response.send(users);
        };
        this.getUserById = async (request, response, next) => {
            const id = request.params.id;
            const user = await this.userRespotity.findOne({ relations: ["profile", "profile.address", "profile.generalProfile", "profile.workExs", "profile.portfilios"], where: {
                    id: Number(id)
                } });
            if (user) {
                response.send(user);
            }
            else {
                next(new UserNotFoundException_1.default(id));
            }
        };
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