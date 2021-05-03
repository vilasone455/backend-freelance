"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.secretKey = void 0;
exports.secretKey = "freelance-6@!467^-x&H@(&";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppRoutes = void 0;
exports.AppRoutes = [];
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserWithThatEmailAlreadyExistsException_1 = require("../exceptions/UserWithThatEmailAlreadyExistsException");
const User_1 = require("../entity/User");
const typeorm_1 = require("typeorm");
class AuthenticationService {
    constructor() {
        this.userRepository = typeorm_1.getRepository(User_1.User);
    }
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.userRepository.findOne({ userEmail: userData.userEmail })) {
                throw new UserWithThatEmailAlreadyExistsException_1.default(userData.userEmail);
            }
            const hashedPassword = yield bcrypt.hash(userData.userPassword, 10);
            const user = yield this.userRepository.save(Object.assign(Object.assign({}, userData), { userPassword: hashedPassword }));
            const tokenData = this.createToken(user);
            const cookie = this.createCookie(tokenData);
            return {
                cookie,
                user,
            };
        });
    }
    createCookie(tokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }
    createToken(user) {
        const expiresIn = 60 * 60;
        const secret = "freelance-6@!467^-x&H@(&";
        const dataStoredInToken = {
            _id: user.id,
        };
        return {
            expiresIn,
            token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
        };
    }
}
exports.default = AuthenticationService;
Object.defineProperty(exports, "__esModule", { value: true });
class LogInDto {
}
exports.default = LogInDto;
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserDto = void 0;
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
        r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
        return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
const typeorm_1 = require("typeorm");
let Address = class Address {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Address.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Address.prototype, "village", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Address.prototype, "city", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Address.prototype, "capital", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Address.prototype, "tel", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Address.prototype, "gmail", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Address.prototype, "facebookLink", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Address.prototype, "linkedinLink", void 0);
Address = __decorate([
    typeorm_1.Entity()
], Address);
exports.Address = Address;
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
        r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
        return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Education = void 0;
const typeorm_1 = require("typeorm");
const Profile_1 = require("./Profile");
let Education = class Education {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Education.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Profile_1.Profile, p => p.educations),
    __metadata("design:type", Profile_1.Profile)
], Education.prototype, "profile", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Education.prototype, "schoolName", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Education.prototype, "degree", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Education.prototype, "start", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Education.prototype, "end", void 0);
Education = __decorate([
    typeorm_1.Entity()
], Education);
exports.Education = Education;
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
        r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
        return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneralProfile = void 0;
const typeorm_1 = require("typeorm");
const Profile_1 = require("./Profile");
let GeneralProfile = class GeneralProfile {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], GeneralProfile.prototype, "id", void 0);
__decorate([
    typeorm_1.OneToOne(() => Profile_1.Profile, p => p.generalProfile),
    __metadata("design:type", Profile_1.Profile)
], GeneralProfile.prototype, "profile", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], GeneralProfile.prototype, "firstName", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], GeneralProfile.prototype, "lastName", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], GeneralProfile.prototype, "birthDate", void 0);
__decorate([
    typeorm_1.Column({ default: "" }),
    __metadata("design:type", String)
], GeneralProfile.prototype, "jobType", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], GeneralProfile.prototype, "aboutMe", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], GeneralProfile.prototype, "gender", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], GeneralProfile.prototype, "photo", void 0);
GeneralProfile = __decorate([
    typeorm_1.Entity()
], GeneralProfile);
exports.GeneralProfile = GeneralProfile;
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
        r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
        return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobPost = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
let JobPost = class JobPost {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], JobPost.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(() => User_1.User, u => u.jobPosts),
    __metadata("design:type", User_1.User)
], JobPost.prototype, "user", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], JobPost.prototype, "title", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], JobPost.prototype, "typeJob", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], JobPost.prototype, "postDate", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], JobPost.prototype, "description", void 0);
__decorate([
    typeorm_1.Column({ nullable: false, default: "fix" }),
    __metadata("design:type", String)
], JobPost.prototype, "budgetType", void 0);
__decorate([
    typeorm_1.Column({ default: 0 }),
    __metadata("design:type", Number)
], JobPost.prototype, "budgetStart", void 0);
__decorate([
    typeorm_1.Column({ default: 0 }),
    __metadata("design:type", Number)
], JobPost.prototype, "budgetEnd", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], JobPost.prototype, "skillRequires", void 0);
JobPost = __decorate([
    typeorm_1.Entity()
], JobPost);
exports.JobPost = JobPost;
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
        r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
        return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Portfilio = void 0;
const typeorm_1 = require("typeorm");
const Profile_1 = require("./Profile");
let Portfilio = class Portfilio {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Portfilio.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Profile_1.Profile, p => p.portfilios),
    __metadata("design:type", Profile_1.Profile)
], Portfilio.prototype, "profile", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Portfilio.prototype, "projectName", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Portfilio.prototype, "projectDescription", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Portfilio.prototype, "link", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Portfilio.prototype, "start", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Portfilio.prototype, "end", void 0);
__decorate([
    typeorm_1.Column({ default: "" }),
    __metadata("design:type", String)
], Portfilio.prototype, "portfilioImages", void 0);
Portfilio = __decorate([
    typeorm_1.Entity()
], Portfilio);
exports.Portfilio = Portfilio;
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
        r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
        return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfilioImage = void 0;
const typeorm_1 = require("typeorm");
const Portfilio_1 = require("./Portfilio");
let PortfilioImage = class PortfilioImage {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], PortfilioImage.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Portfilio_1.Portfilio, p => p.portfilioImages),
    __metadata("design:type", Portfilio_1.Portfilio)
], PortfilioImage.prototype, "portfilio", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], PortfilioImage.prototype, "link", void 0);
PortfilioImage = __decorate([
    typeorm_1.Entity()
], PortfilioImage);
exports.PortfilioImage = PortfilioImage;
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
        r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
        return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profile = void 0;
const typeorm_1 = require("typeorm");
const Address_1 = require("./Address");
const Education_1 = require("./Education");
const GeneralProfile_1 = require("./GeneralProfile");
const Portfilio_1 = require("./Portfilio");
const Skill_1 = require("./Skill");
const WorkEx_1 = require("./WorkEx");
let Profile = class Profile {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Profile.prototype, "id", void 0);
__decorate([
    typeorm_1.OneToOne(() => GeneralProfile_1.GeneralProfile, g => g.profile),
    typeorm_1.JoinColumn(),
    __metadata("design:type", GeneralProfile_1.GeneralProfile)
], Profile.prototype, "generalProfile", void 0);
__decorate([
    typeorm_1.OneToOne(() => Address_1.Address),
    typeorm_1.JoinColumn(),
    __metadata("design:type", Address_1.Address)
], Profile.prototype, "address", void 0);
__decorate([
    typeorm_1.OneToMany(() => Education_1.Education, e => e.profile),
    __metadata("design:type", Array)
], Profile.prototype, "educations", void 0);
__decorate([
    typeorm_1.OneToMany(() => WorkEx_1.WorkEx, w => w.profile),
    __metadata("design:type", Array)
], Profile.prototype, "workExs", void 0);
__decorate([
    typeorm_1.OneToMany(() => Portfilio_1.Portfilio, w => w.profile),
    __metadata("design:type", Array)
], Profile.prototype, "portfilios", void 0);
__decorate([
    typeorm_1.OneToMany(() => Skill_1.Skill, s => s.profile),
    __metadata("design:type", Array)
], Profile.prototype, "skills", void 0);
Profile = __decorate([
    typeorm_1.Entity()
], Profile);
exports.Profile = Profile;
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
        r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
        return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skill = void 0;
const typeorm_1 = require("typeorm");
const Profile_1 = require("./Profile");
let Skill = class Skill {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Skill.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Profile_1.Profile, p => p.skills),
    __metadata("design:type", Profile_1.Profile)
], Skill.prototype, "profile", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Skill.prototype, "skillName", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Skill.prototype, "skillClass", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Skill.prototype, "level", void 0);
Skill = __decorate([
    typeorm_1.Entity()
], Skill);
exports.Skill = Skill;
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
        r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
        return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typeorm_1 = require("typeorm");
const JobPost_1 = require("./JobPost");
const Profile_1 = require("./Profile");
let User = class User {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "userName", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "userEmail", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], User.prototype, "userPassword", void 0);
__decorate([
    typeorm_1.OneToOne(() => Profile_1.Profile),
    typeorm_1.JoinColumn(),
    __metadata("design:type", Profile_1.Profile)
], User.prototype, "profile", void 0);
__decorate([
    typeorm_1.OneToMany(() => JobPost_1.JobPost, j => j.user),
    __metadata("design:type", Array)
], User.prototype, "jobPosts", void 0);
User = __decorate([
    typeorm_1.Entity()
], User);
exports.User = User;
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
        r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
        return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkEx = void 0;
const typeorm_1 = require("typeorm");
const Profile_1 = require("./Profile");
let WorkEx = class WorkEx {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], WorkEx.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Profile_1.Profile, p => p.workExs),
    __metadata("design:type", Profile_1.Profile)
], WorkEx.prototype, "profile", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], WorkEx.prototype, "companyName", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], WorkEx.prototype, "position", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], WorkEx.prototype, "aboutWork", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], WorkEx.prototype, "start", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], WorkEx.prototype, "end", void 0);
WorkEx = __decorate([
    typeorm_1.Entity()
], WorkEx);
exports.WorkEx = WorkEx;
Object.defineProperty(exports, "__esModule", { value: true });
const HttpException_1 = require("./HttpException");
class AuthenticationTokenMissingException extends HttpException_1.default {
    constructor() {
        super(401, 'Authentication token missing');
    }
}
exports.default = AuthenticationTokenMissingException;
Object.defineProperty(exports, "__esModule", { value: true });
class HttpException extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.message = message;
    }
}
exports.default = HttpException;
Object.defineProperty(exports, "__esModule", { value: true });
const HttpException_1 = require("./HttpException");
class NotAuthorizedException extends HttpException_1.default {
    constructor() {
        super(403, "You're not authorized");
    }
}
exports.default = NotAuthorizedException;
Object.defineProperty(exports, "__esModule", { value: true });
const HttpException_1 = require("./HttpException");
class PostNotFoundException extends HttpException_1.default {
    constructor(id) {
        super(404, `Post with id ${id} not found`);
    }
}
exports.default = PostNotFoundException;
Object.defineProperty(exports, "__esModule", { value: true });
const HttpException_1 = require("./HttpException");
class UserNotFoundException extends HttpException_1.default {
    constructor(id) {
        super(404, `User with id ${id} not found`);
    }
}
exports.default = UserNotFoundException;
Object.defineProperty(exports, "__esModule", { value: true });
const HttpException_1 = require("./HttpException");
class UserWithThatEmailAlreadyExistsException extends HttpException_1.default {
    constructor(email) {
        super(400, `User with email ${email} already exists`);
    }
}
exports.default = UserWithThatEmailAlreadyExistsException;
Object.defineProperty(exports, "__esModule", { value: true });
const HttpException_1 = require("./HttpException");
class WrongAuthenticationTokenException extends HttpException_1.default {
    constructor() {
        super(401, 'Wrong authentication token');
    }
}
exports.default = WrongAuthenticationTokenException;
Object.defineProperty(exports, "__esModule", { value: true });
const HttpException_1 = require("./HttpException");
class WrongCredentialsException extends HttpException_1.default {
    constructor() {
        super(401, 'Wrong credentials provided');
    }
}
exports.default = WrongCredentialsException;
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const AuthenticationTokenMissingException_1 = require("../exceptions/AuthenticationTokenMissingException");
const WrongAuthenticationTokenException_1 = require("../exceptions/WrongAuthenticationTokenException");
const User_1 = require("../entity/User");
const typeorm_1 = require("typeorm");
const env_1 = require("../../env");
function authMiddleware(request, response, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = request.headers["authorization"];
        if (auth) {
            const secret = env_1.secretKey;
            const userRepository = typeorm_1.getRepository(User_1.User);
            try {
                const verificationResponse = jwt.verify(auth, secret);
                const userTokenId = verificationResponse._id;
                const user = yield userRepository.findOne({ id: userTokenId });
                if (user) {
                    request.user = user;
                    next();
                }
                else {
                    next(new WrongAuthenticationTokenException_1.default());
                }
            }
            catch (error) {
                next(new WrongAuthenticationTokenException_1.default());
            }
        }
        else {
            next(new AuthenticationTokenMissingException_1.default());
        }
    });
}
exports.default = authMiddleware;
Object.defineProperty(exports, "__esModule", { value: true });
function errorMiddleware(error, request, response, next) {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';
    response
        .status(status)
        .send({
        message,
        status,
    });
}
exports.default = errorMiddleware;
Object.defineProperty(exports, "__esModule", { value: true });
function loggerMiddleware(request, response, next) {
    console.log(`${request.method} ${request.path}`);
    next();
}
exports.default = loggerMiddleware;
Object.defineProperty(exports, "__esModule", { value: true });
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const HttpException_1 = require("../exceptions/HttpException");
function validationMiddleware(type, skipMissingProperties = false) {
    return (req, res, next) => {
        class_validator_1.validate(class_transformer_1.plainToClass(type, req.body), { skipMissingProperties })
            .then((errors) => {
            if (errors.length > 0) {
                const message = errors.map((error) => Object.values(error.constraints)).join(', ');
                next(new HttpException_1.default(400, message));
            }
            else {
                next();
            }
        });
    };
}
exports.default = validationMiddleware;
