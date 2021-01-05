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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const chat_gateway_1 = require("./chat.gateway");
const user_entity_1 = require("../user/entity/user.entity");
const group_entity_1 = require("../group/entity/group.entity");
const groupMessage_entity_1 = require("../group/entity/groupMessage.entity");
const friend_entity_1 = require("../friend/entity/friend.entity");
const friendMessage_entity_1 = require("../friend/entity/friendMessage.entity");
const typeorm_2 = require("@nestjs/typeorm");
const typeorm_3 = require("typeorm");
let ChatModule = class ChatModule {
    constructor(groupRepository) {
        this.groupRepository = groupRepository;
    }
    async onModuleInit() {
        const defaultGroup = await this.groupRepository.find({ groupName: '临冬城聊天室' });
        if (!defaultGroup.length) {
            await this.groupRepository.save({
                groupId: '临冬城聊天室',
                groupName: '临冬城聊天室',
                userId: 'admin',
                createTime: new Date().valueOf()
            });
            console.log('create default group 临冬城聊天室');
        }
    }
};
ChatModule = __decorate([
    common_1.Module({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, group_entity_1.Group, group_entity_1.GroupMap, groupMessage_entity_1.GroupMessage, friend_entity_1.UserMap, friendMessage_entity_1.FriendMessage])
        ],
        providers: [chat_gateway_1.ChatGateway],
    }),
    __param(0, typeorm_2.InjectRepository(group_entity_1.Group)),
    __metadata("design:paramtypes", [typeorm_3.Repository])
], ChatModule);
exports.ChatModule = ChatModule;
//# sourceMappingURL=chat.module.js.map