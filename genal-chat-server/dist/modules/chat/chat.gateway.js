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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../user/entity/user.entity");
const group_entity_1 = require("../group/entity/group.entity");
const groupMessage_entity_1 = require("../group/entity/groupMessage.entity");
const friend_entity_1 = require("../friend/entity/friend.entity");
const friendMessage_entity_1 = require("../friend/entity/friendMessage.entity");
const fs_1 = require("fs");
const path_1 = require("path");
const rcode_1 = require("../../common/constant/rcode");
const utils_1 = require("../../common/tool/utils");
let ChatGateway = class ChatGateway {
    constructor(userRepository, groupRepository, groupUserRepository, groupMessageRepository, friendRepository, friendMessageRepository) {
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.groupUserRepository = groupUserRepository;
        this.groupMessageRepository = groupMessageRepository;
        this.friendRepository = friendRepository;
        this.friendMessageRepository = friendMessageRepository;
        this.defaultGroup = '临冬城聊天室';
    }
    async handleConnection(client) {
        const userRoom = client.handshake.query.userId;
        client.join(this.defaultGroup);
        this.getActiveGroupUser();
        if (userRoom) {
            client.join(userRoom);
        }
        return '连接成功';
    }
    async handleDisconnect() {
        this.getActiveGroupUser();
    }
    async addGroup(client, data) {
        const isUser = await this.userRepository.findOne({ userId: data.userId });
        if (isUser) {
            const isHaveGroup = await this.groupRepository.findOne({ groupName: data.groupName });
            if (isHaveGroup) {
                this.server.to(data.userId).emit('addGroup', { code: rcode_1.RCode.FAIL, msg: '该群名字已存在', data: isHaveGroup });
                return;
            }
            if (!utils_1.nameVerify(data.groupName)) {
                return;
            }
            data = await this.groupRepository.save(data);
            client.join(data.groupId);
            const group = await this.groupUserRepository.save(data);
            this.server.to(group.groupId).emit('addGroup', { code: rcode_1.RCode.OK, msg: `成功创建群${data.groupName}`, data: group });
            this.getActiveGroupUser();
        }
        else {
            this.server.to(data.userId).emit('addGroup', { code: rcode_1.RCode.FAIL, msg: `你没资格创建群` });
        }
    }
    async joinGroup(client, data) {
        const isUser = await this.userRepository.findOne({ userId: data.userId });
        if (isUser) {
            const group = await this.groupRepository.findOne({ groupId: data.groupId });
            let userGroup = await this.groupUserRepository.findOne({ groupId: group.groupId, userId: data.userId });
            const user = await this.userRepository.findOne({ userId: data.userId });
            if (group && user) {
                if (!userGroup) {
                    data.groupId = group.groupId;
                    userGroup = await this.groupUserRepository.save(data);
                }
                client.join(group.groupId);
                const res = { group: group, user: user };
                this.server.to(group.groupId).emit('joinGroup', {
                    code: rcode_1.RCode.OK,
                    msg: `${user.username}加入群${group.groupName}`,
                    data: res
                });
                this.getActiveGroupUser();
            }
            else {
                this.server.to(data.userId).emit('joinGroup', { code: rcode_1.RCode.FAIL, msg: '进群失败', data: '' });
            }
        }
        else {
            this.server.to(data.userId).emit('joinGroup', { code: rcode_1.RCode.FAIL, msg: '你没资格进群' });
        }
    }
    async joinGroupSocket(client, data) {
        const group = await this.groupRepository.findOne({ groupId: data.groupId });
        const user = await this.userRepository.findOne({ userId: data.userId });
        if (group && user) {
            client.join(group.groupId);
            const res = { group: group, user: user };
            this.server.to(group.groupId).emit('joinGroupSocket', { code: rcode_1.RCode.OK, msg: `${user.username}加入群${group.groupName}`, data: res });
        }
        else {
            this.server.to(data.userId).emit('joinGroupSocket', { code: rcode_1.RCode.FAIL, msg: '进群失败', data: '' });
        }
    }
    async sendGroupMessage(data) {
        const isUser = await this.userRepository.findOne({ userId: data.userId });
        if (isUser) {
            const userGroupMap = await this.groupUserRepository.findOne({ userId: data.userId, groupId: data.groupId });
            if (!userGroupMap || !data.groupId) {
                this.server.to(data.userId).emit('groupMessage', { code: rcode_1.RCode.FAIL, msg: '群消息发送错误', data: '' });
                return;
            }
            if (data.messageType === 'image') {
                const randomName = `${Date.now()}$${data.userId}$${data.width}$${data.height}`;
                const stream = fs_1.createWriteStream(path_1.join('public/static', randomName));
                stream.write(data.content);
                data.content = randomName;
            }
            data.time = new Date().valueOf();
            await this.groupMessageRepository.save(data);
            this.server.to(data.groupId).emit('groupMessage', { code: rcode_1.RCode.OK, msg: '', data: data });
        }
        else {
            this.server.to(data.userId).emit('groupMessage', { code: rcode_1.RCode.FAIL, msg: '你没资格发消息' });
        }
    }
    async addFriend(client, data) {
        const isUser = await this.userRepository.findOne({ userId: data.userId });
        if (isUser) {
            if (data.friendId && data.userId) {
                if (data.userId === data.friendId) {
                    this.server.to(data.userId).emit('addFriend', { code: rcode_1.RCode.FAIL, msg: '不能添加自己为好友', data: '' });
                    return;
                }
                const relation1 = await this.friendRepository.findOne({ userId: data.userId, friendId: data.friendId });
                const relation2 = await this.friendRepository.findOne({ userId: data.friendId, friendId: data.userId });
                const roomId = data.userId > data.friendId ? data.userId + data.friendId : data.friendId + data.userId;
                if (relation1 || relation2) {
                    this.server.to(data.userId).emit('addFriend', { code: rcode_1.RCode.FAIL, msg: '已经有该好友', data: data });
                    return;
                }
                const friend = await this.userRepository.findOne({ userId: data.friendId });
                const user = await this.userRepository.findOne({ userId: data.userId });
                if (!friend) {
                    this.server.to(data.userId).emit('addFriend', { code: rcode_1.RCode.FAIL, msg: '该好友不存在', data: '' });
                    return;
                }
                await this.friendRepository.save(data);
                const friendData = JSON.parse(JSON.stringify(data));
                const friendId = friendData.friendId;
                friendData.friendId = friendData.userId;
                friendData.userId = friendId;
                delete friendData._id;
                await this.friendRepository.save(friendData);
                client.join(roomId);
                let messages = await typeorm_2.getRepository(friendMessage_entity_1.FriendMessage)
                    .createQueryBuilder("friendMessage")
                    .orderBy("friendMessage.time", "DESC")
                    .where("friendMessage.userId = :userId AND friendMessage.friendId = :friendId", { userId: data.userId, friendId: data.friendId })
                    .orWhere("friendMessage.userId = :friendId AND friendMessage.friendId = :userId", { userId: data.userId, friendId: data.friendId })
                    .take(30)
                    .getMany();
                messages = messages.reverse();
                if (messages.length) {
                    friend.messages = messages;
                    user.messages = messages;
                }
                this.server.to(data.userId).emit('addFriend', { code: rcode_1.RCode.OK, msg: `添加好友${friend.username}成功`, data: friend });
                this.server.to(data.friendId).emit('addFriend', { code: rcode_1.RCode.OK, msg: `${user.username}添加你为好友`, data: user });
            }
        }
        else {
            this.server.to(data.userId).emit('addFriend', { code: rcode_1.RCode.FAIL, msg: '你没资格加好友' });
        }
    }
    async joinFriend(client, data) {
        if (data.friendId && data.userId) {
            const relation = await this.friendRepository.findOne({ userId: data.userId, friendId: data.friendId });
            const roomId = data.userId > data.friendId ? data.userId + data.friendId : data.friendId + data.userId;
            if (relation) {
                client.join(roomId);
                this.server.to(data.userId).emit('joinFriendSocket', { code: rcode_1.RCode.OK, msg: '进入私聊socket成功', data: relation });
            }
        }
    }
    async friendMessage(client, data) {
        const isUser = await this.userRepository.findOne({ userId: data.userId });
        if (isUser) {
            if (data.userId && data.friendId) {
                const roomId = data.userId > data.friendId ? data.userId + data.friendId : data.friendId + data.userId;
                if (data.messageType === 'image') {
                    const randomName = `${Date.now()}$${roomId}$${data.width}$${data.height}`;
                    const stream = fs_1.createWriteStream(path_1.join('public/static', randomName));
                    stream.write(data.content);
                    data.content = randomName;
                }
                data.time = new Date().valueOf();
                await this.friendMessageRepository.save(data);
                this.server.to(roomId).emit('friendMessage', { code: rcode_1.RCode.OK, msg: '', data });
            }
        }
        else {
            this.server.to(data.userId).emit('friendMessage', { code: rcode_1.RCode.FAIL, msg: '你没资格发消息', data });
        }
    }
    async getAllData(client, user) {
        const isUser = await this.userRepository.findOne({ userId: user.userId, password: user.password });
        if (isUser) {
            let groupArr = [];
            let friendArr = [];
            const userGather = {};
            let userArr = [];
            const groupMap = await this.groupUserRepository.find({ userId: user.userId });
            const friendMap = await this.friendRepository.find({ userId: user.userId });
            const groupPromise = groupMap.map(async (item) => {
                return await this.groupRepository.findOne({ groupId: item.groupId });
            });
            const groupMessagePromise = groupMap.map(async (item) => {
                let groupMessage = await typeorm_2.getRepository(groupMessage_entity_1.GroupMessage)
                    .createQueryBuilder("groupMessage")
                    .orderBy("groupMessage.time", "DESC")
                    .where("groupMessage.groupId = :id", { id: item.groupId })
                    .take(30)
                    .getMany();
                groupMessage = groupMessage.reverse();
                for (const message of groupMessage) {
                    if (!userGather[message.userId]) {
                        userGather[message.userId] = await this.userRepository.findOne({ userId: message.userId });
                    }
                }
                return groupMessage;
            });
            const friendPromise = friendMap.map(async (item) => {
                return await this.userRepository.findOne({
                    where: { userId: item.friendId }
                });
            });
            const friendMessagePromise = friendMap.map(async (item) => {
                const messages = await typeorm_2.getRepository(friendMessage_entity_1.FriendMessage)
                    .createQueryBuilder("friendMessage")
                    .orderBy("friendMessage.time", "DESC")
                    .where("friendMessage.userId = :userId AND friendMessage.friendId = :friendId", { userId: item.userId, friendId: item.friendId })
                    .orWhere("friendMessage.userId = :friendId AND friendMessage.friendId = :userId", { userId: item.userId, friendId: item.friendId })
                    .take(30)
                    .getMany();
                return messages.reverse();
            });
            const groups = await Promise.all(groupPromise);
            const groupsMessage = await Promise.all(groupMessagePromise);
            groups.map((group, index) => {
                if (groupsMessage[index] && groupsMessage[index].length) {
                    group.messages = groupsMessage[index];
                }
            });
            groupArr = groups;
            const friends = await Promise.all(friendPromise);
            const friendsMessage = await Promise.all(friendMessagePromise);
            friends.map((friend, index) => {
                if (friendsMessage[index] && friendsMessage[index].length) {
                    friend.messages = friendsMessage[index];
                }
            });
            friendArr = friends;
            userArr = [...Object.values(userGather), ...friendArr];
            this.server.to(user.userId).emit('chatData', { code: rcode_1.RCode.OK, msg: '获取聊天数据成功', data: {
                    groupData: groupArr,
                    friendData: friendArr,
                    userData: userArr
                } });
        }
    }
    async exitGroup(client, groupMap) {
        if (groupMap.groupId === this.defaultGroup) {
            return this.server.to(groupMap.userId).emit('exitGroup', { code: rcode_1.RCode.FAIL, msg: '默认群不可退' });
        }
        const user = await this.userRepository.findOne({ userId: groupMap.userId });
        const group = await this.groupRepository.findOne({ groupId: groupMap.groupId });
        const map = await this.groupUserRepository.findOne({ userId: groupMap.userId, groupId: groupMap.groupId });
        if (user && group && map) {
            await this.groupUserRepository.remove(map);
            this.server.to(groupMap.userId).emit('exitGroup', { code: rcode_1.RCode.OK, msg: '退群成功', data: groupMap });
            return this.getActiveGroupUser();
        }
        this.server.to(groupMap.userId).emit('exitGroup', { code: rcode_1.RCode.FAIL, msg: '退群失败' });
    }
    async exitFriend(client, userMap) {
        const user = await this.userRepository.findOne({ userId: userMap.userId });
        const friend = await this.userRepository.findOne({ userId: userMap.friendId });
        const map1 = await this.friendRepository.findOne({ userId: userMap.userId, friendId: userMap.friendId });
        const map2 = await this.friendRepository.findOne({ userId: userMap.friendId, friendId: userMap.userId });
        if (user && friend && map1 && map2) {
            await this.friendRepository.remove(map1);
            await this.friendRepository.remove(map2);
            return this.server.to(userMap.userId).emit('exitFriend', { code: rcode_1.RCode.OK, msg: '删好友成功', data: userMap });
        }
        this.server.to(userMap.userId).emit('exitFriend', { code: rcode_1.RCode.FAIL, msg: '删好友失败' });
    }
    async getActiveGroupUser() {
        let userIdArr = Object.values(this.server.engine.clients).map(item => {
            return item.request._query.userId;
        });
        userIdArr = Array.from(new Set(userIdArr));
        const activeGroupUserGather = {};
        for (const userId of userIdArr) {
            const userGroupArr = await this.groupUserRepository.find({ userId: userId });
            const user = await this.userRepository.findOne({ userId: userId });
            if (user && userGroupArr.length) {
                userGroupArr.map(item => {
                    if (!activeGroupUserGather[item.groupId]) {
                        activeGroupUserGather[item.groupId] = {};
                    }
                    activeGroupUserGather[item.groupId][userId] = user;
                });
            }
        }
        this.server.to(this.defaultGroup).emit('activeGroupUser', {
            msg: 'activeGroupUser',
            data: activeGroupUserGather
        });
    }
};
__decorate([
    websockets_1.WebSocketServer(),
    __metadata("design:type", Object)
], ChatGateway.prototype, "server", void 0);
__decorate([
    websockets_1.SubscribeMessage('addGroup'),
    __param(0, websockets_1.ConnectedSocket()), __param(1, websockets_1.MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, group_entity_1.Group]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "addGroup", null);
__decorate([
    websockets_1.SubscribeMessage('joinGroup'),
    __param(0, websockets_1.ConnectedSocket()), __param(1, websockets_1.MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, group_entity_1.GroupMap]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "joinGroup", null);
__decorate([
    websockets_1.SubscribeMessage('joinGroupSocket'),
    __param(0, websockets_1.ConnectedSocket()), __param(1, websockets_1.MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, group_entity_1.GroupMap]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "joinGroupSocket", null);
__decorate([
    websockets_1.SubscribeMessage('groupMessage'),
    __param(0, websockets_1.MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "sendGroupMessage", null);
__decorate([
    websockets_1.SubscribeMessage('addFriend'),
    __param(0, websockets_1.ConnectedSocket()), __param(1, websockets_1.MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, friend_entity_1.UserMap]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "addFriend", null);
__decorate([
    websockets_1.SubscribeMessage('joinFriendSocket'),
    __param(0, websockets_1.ConnectedSocket()), __param(1, websockets_1.MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, friend_entity_1.UserMap]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "joinFriend", null);
__decorate([
    websockets_1.SubscribeMessage('friendMessage'),
    __param(0, websockets_1.ConnectedSocket()), __param(1, websockets_1.MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "friendMessage", null);
__decorate([
    websockets_1.SubscribeMessage('chatData'),
    __param(0, websockets_1.ConnectedSocket()), __param(1, websockets_1.MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "getAllData", null);
__decorate([
    websockets_1.SubscribeMessage('exitGroup'),
    __param(0, websockets_1.ConnectedSocket()), __param(1, websockets_1.MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, group_entity_1.GroupMap]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "exitGroup", null);
__decorate([
    websockets_1.SubscribeMessage('exitFriend'),
    __param(0, websockets_1.ConnectedSocket()), __param(1, websockets_1.MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, friend_entity_1.UserMap]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "exitFriend", null);
ChatGateway = __decorate([
    websockets_1.WebSocketGateway(),
    __param(0, typeorm_1.InjectRepository(user_entity_1.User)),
    __param(1, typeorm_1.InjectRepository(group_entity_1.Group)),
    __param(2, typeorm_1.InjectRepository(group_entity_1.GroupMap)),
    __param(3, typeorm_1.InjectRepository(groupMessage_entity_1.GroupMessage)),
    __param(4, typeorm_1.InjectRepository(friend_entity_1.UserMap)),
    __param(5, typeorm_1.InjectRepository(friendMessage_entity_1.FriendMessage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map