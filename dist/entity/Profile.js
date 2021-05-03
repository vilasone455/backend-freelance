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
//# sourceMappingURL=Profile.js.map