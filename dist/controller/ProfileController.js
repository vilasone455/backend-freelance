"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Profile_1 = require("../entity/Profile");
const UserNotFoundException_1 = require("../exceptions/UserNotFoundException");
const typeorm_1 = require("typeorm");
const User_1 = require("../entity/User");
const Address_1 = require("../entity/Address");
const GeneralProfile_1 = require("../entity/GeneralProfile");
const WorkEx_1 = require("../entity/WorkEx");
const Skill_1 = require("../entity/Skill");
const Education_1 = require("../entity/Education");
const Portfilio_1 = require("../entity/Portfilio");
const PortfilioImage_1 = require("../entity/PortfilioImage");
class ProfileController {
    constructor() {
        this.path = '/profile';
        this.router = express_1.Router();
        this.profileRespotity = typeorm_1.getRepository(Profile_1.Profile);
        this.userRespotity = typeorm_1.getRepository(User_1.User);
        this.updateProfile = async (request, response, next) => {
            const userId = request.params.id;
            const field = request.params.field;
            const user = await this.userRespotity.findOne({ relations: ["profile", "profile.address", "profile.generalProfile", "profile.workExs", "profile.educations", "profile.skills", "profile.portfilios"], where: { id: Number(userId) } });
            let profile = request.body;
            if (user) {
                if (field === "address") {
                    const addressRes = typeorm_1.getRepository(Address_1.Address);
                    const newAddress = await addressRes.save(profile.address);
                    profile.address = newAddress;
                }
                else if (field === "general") {
                    const generalRes = typeorm_1.getRepository(GeneralProfile_1.GeneralProfile);
                    const general = await generalRes.save(profile.generalProfile);
                    profile.generalProfile = general;
                }
                else if (field === "workexs") {
                    const workExRes = typeorm_1.getRepository(WorkEx_1.WorkEx);
                    const workExs = await workExRes.save(profile.workExs);
                    profile.workExs = workExs;
                }
                else if (field === "portfilios") {
                    const portfilioRes = typeorm_1.getRepository(Portfilio_1.Portfilio);
                    const portfilios = await portfilioRes.save(profile.portfilios);
                    profile.portfilios = portfilios;
                }
                else if (field === "educations") {
                    const educationRes = typeorm_1.getRepository(Education_1.Education);
                    const educations = await educationRes.save(profile.educations);
                    profile.educations = educations;
                }
                const rs = await this.profileRespotity.save(profile);
                response.status(200).send(rs);
            }
            else {
                next(new UserNotFoundException_1.default(userId));
            }
            response.status(200).send("test");
        };
        this.newProfile = async (request, response, next) => {
            const userId = request.params.id;
            const user = await this.userRespotity.findOne({ id: Number(userId) });
            let profile = request.body;
            const addressRes = typeorm_1.getRepository(Address_1.Address);
            const generalRes = typeorm_1.getRepository(GeneralProfile_1.GeneralProfile);
            const workExRes = typeorm_1.getRepository(WorkEx_1.WorkEx);
            const skillRes = typeorm_1.getRepository(Skill_1.Skill);
            const educationRes = typeorm_1.getRepository(Education_1.Education);
            const portfilioRes = typeorm_1.getRepository(Portfilio_1.Portfilio);
            const portfilioImageRes = typeorm_1.getRepository(PortfilioImage_1.PortfilioImage);
            if (user) {
                const newAddress = await addressRes.save(profile.address);
                const newGeneral = await generalRes.save(profile.generalProfile);
                const workExs = await workExRes.save(profile.workExs);
                const skills = await skillRes.save(profile.skills);
                const educations = await educationRes.save(profile.educations);
                const portfilios = await portfilioRes.save(profile.portfilios);
                profile.address = newAddress;
                profile.generalProfile = newGeneral;
                profile.workExs = workExs;
                profile.skills = skills;
                profile.educations = educations;
                profile.portfilios = portfilios;
                const rs = await this.profileRespotity.save(profile);
                user.profile = rs;
                await this.userRespotity.save(user);
                response.status(200).send(rs);
            }
            else {
                next(new UserNotFoundException_1.default(userId));
            }
        };
        this.getAllProject = async (request, response, next) => {
            const users = await this.profileRespotity.find();
            console.log(users.length);
            response.send(users);
        };
        this.getProfile = async (request, response, next) => {
            var userId = request.params.id;
        };
        this.getUserById = async (request, response, next) => {
            const id = request.params.id;
            const findId = Number(id);
            const userQuery = this.profileRespotity.findOne({ id: findId });
            const user = await userQuery;
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
        this.router.get(`${this.path}`, this.getAllProject);
        this.router.put(`${this.path}/:id/:field`, this.updateProfile);
        this.router.post(`${this.path}/:id`, this.newProfile);
    }
}
exports.default = ProfileController;
//# sourceMappingURL=ProfileController.js.map