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
//# sourceMappingURL=authentication.service.js.map