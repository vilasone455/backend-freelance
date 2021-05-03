"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpException_1 = require("./HttpException");
class UserWithThatEmailAlreadyExistsException extends HttpException_1.default {
    constructor(email) {
        super(400, `User with email ${email} already exists`);
    }
}
exports.default = UserWithThatEmailAlreadyExistsException;
//# sourceMappingURL=UserWithThatEmailAlreadyExistsException.js.map