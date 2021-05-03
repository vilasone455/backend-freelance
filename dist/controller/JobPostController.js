"use strict";
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
        this.postJob = async (request, response, next) => {
            const post = request.body;
            const user = request.user;
            const generalRes = typeorm_1.getRepository(GeneralProfile_1.GeneralProfile);
            const skillRes = typeorm_1.getRepository(Skill_1.Skill);
            post.user = user;
            const users = await generalRes.find({ relations: ["profile", "profile.user"],
                where: {
                    "jobType": post.typeJob
                }
            });
            await this.jobPostRespotity.save(post);
            response.send(post);
        };
        this.getAllJob = async (request, response, next) => {
            const rs = await this.jobPostRespotity.find({ relations: ["user"] });
            response.send(rs);
        };
        this.updatePost = async (request, response, next) => {
            const id = request.params.id;
            const user = request.user;
            const updatePost = request.body;
            const post = await this.jobPostRespotity.findOne({ user: user });
            if (post) {
                await this.jobPostRespotity.save(updatePost);
                response.send(updatePost);
            }
            else {
                next(new PostNotFoundException_1.default(id));
            }
        };
        this.getJobById = async (request, response, next) => {
            const id = request.params.id;
            const findId = Number(id);
            const jobQuery = this.jobPostRespotity.findOne({ id: findId });
            const job = await jobQuery;
            if (job) {
                response.send(job);
            }
            else {
                next(new UserNotFoundException_1.default(id));
            }
        };
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