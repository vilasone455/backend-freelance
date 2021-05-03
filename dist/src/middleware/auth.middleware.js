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
//# sourceMappingURL=auth.middleware.js.map