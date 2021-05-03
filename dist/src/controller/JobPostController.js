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
const UserNotFoundException_1 = require("../exceptions/UserNotFoundException");
const typeorm_1 = require("typeorm");
const JobPost_1 = require("../entity/JobPost");
const auth_middleware_1 = require("../middleware/auth.middleware");
const PostNotFoundException_1 = require("../exceptions/PostNotFoundException");
const Skill_1 = require("../entity/Skill");
const GeneralProfile_1 = require("../entity/GeneralProfile");
class JobPostController {
    constructor() {
        this.path = '/jobpost';
        this.router = express_1.Router();
        this.jobPostRespotity = typeorm_1.getRepository(JobPost_1.JobPost);
        this.postJob = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const post = request.body;
            const user = request.user;
            const generalRes = typeorm_1.getRepository(GeneralProfile_1.GeneralProfile);
            const skillRes = typeorm_1.getRepository(Skill_1.Skill);
            post.user = user;
            const users = yield generalRes.find({ relations: ["profile", "profile.user"],
                where: {
                    "jobType": post.typeJob
                }
            });
            yield this.jobPostRespotity.save(post);
            response.send(post);
        });
        this.getAllJob = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const rs = yield this.jobPostRespotity.find({ relations: ["user"] });
            response.send(rs);
        });
        this.updatePost = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const user = request.user;
            const updatePost = request.body;
            const post = yield this.jobPostRespotity.findOne({ user: user });
            if (post) {
                yield this.jobPostRespotity.save(updatePost);
                response.send(updatePost);
            }
            else {
                next(new PostNotFoundException_1.default(id));
            }
        });
        this.getJobById = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const findId = Number(id);
            const jobQuery = this.jobPostRespotity.findOne({ id: findId });
            const job = yield jobQuery;
            if (job) {
                response.send(job);
            }
            else {
                next(new UserNotFoundException_1.default(id));
            }
        });
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(`${this.path}/:id`, this.getJobById);
        this.router.get(`${this.path}`, this.getAllJob);
        this.router.post(`${this.path}`, auth_middleware_1.default, this.postJob);
        this.router.put(`${this.path}/:id`, auth_middleware_1.default, this.updatePost);
    }
}
exports.default = JobPostController;
//# sourceMappingURL=JobPostController.js.map