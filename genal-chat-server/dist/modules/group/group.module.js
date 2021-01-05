"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const group_service_1 = require("./group.service");
const group_controller_1 = require("./group.controller");
const group_entity_1 = require("./entity/group.entity");
const groupMessage_entity_1 = require("./entity/groupMessage.entity");
let GroupModule = class GroupModule {
};
GroupModule = __decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([group_entity_1.Group, group_entity_1.GroupMap, groupMessage_entity_1.GroupMessage]),
        ],
        providers: [group_service_1.GroupService],
        controllers: [group_controller_1.GroupController],
    })
], GroupModule);
exports.GroupModule = GroupModule;
//# sourceMappingURL=group.module.js.map