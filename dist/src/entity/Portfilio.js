"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
//# sourceMappingURL=Portfilio.js.map