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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const user_entity_1 = require("./entity/user.entity");
const group_entity_1 = require("../group/entity/group.entity");
const fs_1 = require("fs");
const path_1 = require("path");
const rcode_1 = require("../../common/constant/rcode");
const groupMessage_entity_1 = require("../group/entity/groupMessage.entity");
const friend_entity_1 = require("../friend/entity/friend.entity");
const friendMessage_entity_1 = require("../friend/entity/friendMessage.entity");
const utils_1 = require("../../common/tool/utils");
let UserService = class UserService {
    constructor(userRepository, groupRepository, groupUserRepository, groupMessageRepository, friendRepository, friendMessageRepository) {
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.groupUserRepository = groupUserRepository;
        this.groupMessageRepository = groupMessageRepository;
        this.friendRepository = friendRepository;
        this.friendMessageRepository = friendMessageRepository;
    }
    async getUser(userId) {
        try {
            let data;
            if (userId) {
                data = await this.userRepository.findOne({
                    where: { userId: userId }
                });
                return { msg: '获取用户成功', data };
            }
        }
        catch (e) {
            return { code: rcode_1.RCode.ERROR, msg: '获取用户失败', data: e };
        }
    }
    async postUsers(userIds) {
        try {
            if (userIds) {
                const userIdArr = userIds.split(',');
                const userArr = [];
                for (const userId of userIdArr) {
                    if (userId) {
                        const data = await this.userRepository.findOne({
                            where: { userId: userId }
                        });
                        userArr.push(data);
                    }
                }
                return { msg: '获取用户信息成功', data: userArr };
            }
            return { code: rcode_1.RCode.FAIL, msg: '获取用户信息失败', data: null };
        }
        catch (e) {
            return { code: rcode_1.RCode.ERROR, msg: '获取用户信息失败', data: e };
        }
    }
    async updateUserName(user) {
        try {
            const oldUser = await this.userRepository.findOne({ userId: user.userId, password: user.password });
            if (oldUser && utils_1.nameVerify(user.username)) {
                const isHaveName = await this.userRepository.findOne({ username: user.username });
                if (isHaveName) {
                    return { code: 1, msg: '用户名重复', data: '' };
                }
                const newUser = JSON.parse(JSON.stringify(oldUser));
                newUser.username = user.username;
                newUser.password = user.password;
                await this.userRepository.update(oldUser, newUser);
                return { msg: '更新用户名成功', data: newUser };
            }
            return { code: rcode_1.RCode.FAIL, msg: '更新失败', data: '' };
        }
        catch (e) {
            return { code: rcode_1.RCode.ERROR, msg: '更新用户名失败', data: e };
        }
    }
    async updatePassword(user, password) {
        try {
            const oldUser = await this.userRepository.findOne({ userId: user.userId, username: user.username, password: user.password });
            if (oldUser && utils_1.passwordVerify(password)) {
                const newUser = JSON.parse(JSON.stringify(oldUser));
                newUser.password = password;
                await this.userRepository.update(oldUser, newUser);
                return { msg: '更新用户密码成功', data: newUser };
            }
            return { code: rcode_1.RCode.FAIL, msg: '更新失败', data: '' };
        }
        catch (e) {
            return { code: rcode_1.RCode.ERROR, msg: '更新用户密码失败', data: e };
        }
    }
    async jurisdiction(userId) {
        const user = await this.userRepository.findOne({ userId: userId });
        const newUser = JSON.parse(JSON.stringify(user));
        if (user.username === '陈冠希') {
            newUser.role = 'admin';
            await this.userRepository.update(user, newUser);
            return { msg: '更新用户信息成功', data: newUser };
        }
    }
    async delUser(uid, psw, did) {
        try {
            const user = await this.userRepository.findOne({ userId: uid, password: psw });
            if (user.role === 'admin' && user.username === '陈冠希') {
                const groups = await this.groupRepository.find({ userId: did });
                for (const group of groups) {
                    await this.groupRepository.delete({ groupId: group.groupId });
                    await this.groupUserRepository.delete({ groupId: group.groupId });
                    await this.groupMessageRepository.delete({ groupId: group.groupId });
                }
                await this.groupUserRepository.delete({ userId: did });
                await this.groupMessageRepository.delete({ userId: did });
                await this.friendRepository.delete({ userId: did });
                await this.friendRepository.delete({ friendId: did });
                await this.friendMessageRepository.delete({ userId: did });
                await this.friendMessageRepository.delete({ friendId: did });
                await this.userRepository.delete({ userId: did });
                return { msg: '用户删除成功' };
            }
            return { code: rcode_1.RCode.FAIL, msg: '用户删除失败' };
        }
        catch (e) {
            return { code: rcode_1.RCode.ERROR, msg: '用户删除失败', data: e };
        }
    }
    async getUsersByName(username) {
        try {
            if (username) {
                const users = await this.userRepository.find({
                    where: { username: typeorm_1.Like(`%${username}%`) }
                });
                return { data: users };
            }
            return { code: rcode_1.RCode.FAIL, msg: '请输入用户名', data: null };
        }
        catch (e) {
            return { code: rcode_1.RCode.ERROR, msg: '查找用户错误', data: null };
        }
    }
    async setUserAvatar(user, file) {
        const newUser = await this.userRepository.findOne({ userId: user.userId, password: user.password });
        if (newUser) {
            const random = Date.now() + '&';
            const stream = fs_1.createWriteStream(path_1.join('public/avatar', random + file.originalname));
            stream.write(file.buffer);
            newUser.avatar = `api/avatar/${random}${file.originalname}`;
            newUser.password = user.password;
            await this.userRepository.save(newUser);
            return { msg: '修改头像成功', data: newUser };
        }
        else {
            return { code: rcode_1.RCode.FAIL, msg: '修改头像失败' };
        }
    }
};
UserService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_2.InjectRepository(user_entity_1.User)),
    __param(1, typeorm_2.InjectRepository(group_entity_1.Group)),
    __param(2, typeorm_2.InjectRepository(group_entity_1.GroupMap)),
    __param(3, typeorm_2.InjectRepository(groupMessage_entity_1.GroupMessage)),
    __param(4, typeorm_2.InjectRepository(friend_entity_1.UserMap)),
    __param(5, typeorm_2.InjectRepository(friendMessage_entity_1.FriendMessage)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map