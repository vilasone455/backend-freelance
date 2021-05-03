"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpException_1 = require("./HttpException");
class UserNotFoundException extends HttpException_1.default {
    constructor(id) {
        super(404, `User with id ${id} not found`);
    }
}
exports.default = UserNotFoundException;
//# sourceMappingURL=UserNotFoundException.js.map