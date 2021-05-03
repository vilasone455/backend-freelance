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
//# sourceMappingURL=GeneralProfile.js.map