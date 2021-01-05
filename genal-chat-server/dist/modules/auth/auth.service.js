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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../user/entity/user.entity");
const group_entity_1 = require("../group/entity/group.entity");
const utils_1 = require("../../common/tool/utils");
const rcode_1 = require("../../common/constant/rcode");
let AuthService = class AuthService {
    constructor(userRepository, groupUserRepository, jwtService) {
        this.userRepository = userRepository;
        this.groupUserRepository = groupUserRepository;
        this.jwtService = jwtService;
    }
    async login(data) {
        const user = await this.userRepository.findOne({ username: data.username, password: data.password });
        if (!user) {
            return { code: 1, msg: '密码错误', data: '' };
        }
        if (!utils_1.passwordVerify(data.password) || !utils_1.nameVerify(data.username)) {
            return { code: rcode_1.RCode.FAIL, msg: '注册校验不通过！', data: '' };
        }
        user.password = data.password;
        const payload = { userId: user.userId, password: data.password };
        return {
            msg: '登录成功',
            data: {
                user: user,
                token: this.jwtService.sign(payload)
            },
        };
    }
    async register(user) {
        const isHave = await this.userRepository.find({ username: user.username });
        if (isHave.length) {
            return { code: rcode_1.RCode.FAIL, msg: '用户名重复', data: '' };
        }
        if (!utils_1.passwordVerify(user.password) || !utils_1.nameVerify(user.username)) {
            return { code: rcode_1.RCode.FAIL, msg: '注册校验不通过！', data: '' };
        }
        user.avatar = `api/avatar/avatar(${Math.round(Math.random() * 19 + 1)}).png`;
        user.role = 'user';
        const newUser = await this.userRepository.save(user);
        const payload = { userId: newUser.userId, password: newUser.password };
        await this.groupUserRepository.save({
            userId: newUser.userId,
            groupId: '临冬城聊天室',
        });
        return {
            msg: '注册成功',
            data: {
                user: newUser,
                token: this.jwtService.sign(payload)
            },
        };
    }
};
AuthService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(user_entity_1.User)),
    __param(1, typeorm_1.InjectRepository(group_entity_1.GroupMap)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map