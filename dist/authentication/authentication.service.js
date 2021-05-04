"use strict";
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
    async register(userData) {
        if (await this.userRepository.findOne({ userEmail: userData.userEmail })) {
            throw new UserWithThatEmailAlreadyExistsException_1.default(userData.userEmail);
        }
        const hashedPassword = await bcrypt.hash(userData.userPassword, 10);
        const user = await this.userRepository.save(Object.assign(Object.assign({}, userData), { userPassword: hashedPassword }));
        const tokenData = this.createToken(user);
        const cookie = this.createCookie(tokenData);
        return {
            cookie,
            user,
        };
    }
    createCookie(tokenData) {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
    }
    createToken(user) {
        const expiresIn = 60 * 60;
        const secret = process.env.SECRET_KEY;
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