"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function loggerMiddleware(request, response, next) {
    console.log(`${request.method} ${request.path}`);
    next();
}
exports.default = loggerMiddleware;
//# sourceMappingURL=logger.middleware.js.map