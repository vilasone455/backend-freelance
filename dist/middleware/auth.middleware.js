"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const AuthenticationTokenMissingException_1 = require("../exceptions/AuthenticationTokenMissingException");
const WrongAuthenticationTokenException_1 = require("../exceptions/WrongAuthenticationTokenException");
const User_1 = require("../entity/User");
const typeorm_1 = require("typeorm");
async function authMiddleware(request, response, next) {
    const auth = request.headers["authorization"];
    if (auth) {
        const secret = process.env.SECRET_KEY;
        const userRepository = typeorm_1.getRepository(User_1.User);
        try {
            const verificationResponse = jwt.verify(auth, secret);
            const userTokenId = verificationResponse._id;
            const user = await userRepository.findOne({ id: userTokenId });
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
}
exports.default = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map