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
        this.updateProfile = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = request.params.id;
            const field = request.params.field;
            const user = yield this.userRespotity.findOne({ relations: ["profile", "profile.address", "profile.generalProfile", "profile.workExs", "profile.educations", "profile.skills", "profile.portfilios"], where: { id: Number(userId) } });
            let profile = request.body;
            if (user) {
                if (field === "address") {
                    const addressRes = typeorm_1.getRepository(Address_1.Address);
                    const newAddress = yield addressRes.save(profile.address);
                    profile.address = newAddress;
                }
                else if (field === "general") {
                    const generalRes = typeorm_1.getRepository(GeneralProfile_1.GeneralProfile);
                    const general = yield generalRes.save(profile.generalProfile);
                    profile.generalProfile = general;
                }
                else if (field === "workexs") {
                    const workExRes = typeorm_1.getRepository(WorkEx_1.WorkEx);
                    const workExs = yield workExRes.save(profile.workExs);
                    profile.workExs = workExs;
                }
                else if (field === "portfilios") {
                    const portfilioRes = typeorm_1.getRepository(Portfilio_1.Portfilio);
                    const portfilios = yield portfilioRes.save(profile.portfilios);
                    profile.portfilios = portfilios;
                }
                else if (field === "educations") {
                    const educationRes = typeorm_1.getRepository(Education_1.Education);
                    const educations = yield educationRes.save(profile.educations);
                    profile.educations = educations;
                }
                const rs = yield this.profileRespotity.save(profile);
                response.status(200).send(rs);
            }
            else {
                next(new UserNotFoundException_1.default(userId));
            }
            response.status(200).send("test");
        });
        this.newProfile = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const userId = request.params.id;
            const user = yield this.userRespotity.findOne({ id: Number(userId) });
            let profile = request.body;
            const addressRes = typeorm_1.getRepository(Address_1.Address);
            const generalRes = typeorm_1.getRepository(GeneralProfile_1.GeneralProfile);
            const workExRes = typeorm_1.getRepository(WorkEx_1.WorkEx);
            const skillRes = typeorm_1.getRepository(Skill_1.Skill);
            const educationRes = typeorm_1.getRepository(Education_1.Education);
            const portfilioRes = typeorm_1.getRepository(Portfilio_1.Portfilio);
            const portfilioImageRes = typeorm_1.getRepository(PortfilioImage_1.PortfilioImage);
            if (user) {
                const newAddress = yield addressRes.save(profile.address);
                const newGeneral = yield generalRes.save(profile.generalProfile);
                const workExs = yield workExRes.save(profile.workExs);
                const skills = yield skillRes.save(profile.skills);
                const educations = yield educationRes.save(profile.educations);
                const portfilios = yield portfilioRes.save(profile.portfilios);
                profile.address = newAddress;
                profile.generalProfile = newGeneral;
                profile.workExs = workExs;
                profile.skills = skills;
                profile.educations = educations;
                profile.portfilios = portfilios;
                const rs = yield this.profileRespotity.save(profile);
                user.profile = rs;
                yield this.userRespotity.save(user);
                response.status(200).send(rs);
            }
            else {
                next(new UserNotFoundException_1.default(userId));
            }
        });
        this.getAllProject = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const users = yield this.profileRespotity.find();
            console.log(users.length);
            response.send(users);
        });
        this.getProfile = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            var userId = request.params.id;
        });
        this.getUserById = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const id = request.params.id;
            const findId = Number(id);
            const userQuery = this.profileRespotity.findOne({ id: findId });
            const user = yield userQuery;
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
        this.router.get(`${this.path}`, this.getAllProject);
        this.router.put(`${this.path}/:id/:field`, this.updateProfile);
        this.router.post(`${this.path}/:id`, this.newProfile);
    }
}
exports.default = ProfileController;
//# sourceMappingURL=ProfileController.js.map