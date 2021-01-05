import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import { Group, GroupMap } from '../group/entity/group.entity';
import { RCode } from 'src/common/constant/rcode';
import { GroupMessage } from '../group/entity/groupMessage.entity';
import { UserMap } from '../friend/entity/friend.entity';
import { FriendMessage } from '../friend/entity/friendMessage.entity';
export declare class UserService {
    private readonly userRepository;
    private readonly groupRepository;
    private readonly groupUserRepository;
    private readonly groupMessageRepository;
    private readonly friendRepository;
    private readonly friendMessageRepository;
    constructor(userRepository: Repository<User>, groupRepository: Repository<Group>, groupUserRepository: Repository<GroupMap>, groupMessageRepository: Repository<GroupMessage>, friendRepository: Repository<UserMap>, friendMessageRepository: Repository<FriendMessage>);
    getUser(userId: string): Promise<{
        msg: string;
        data: any;
        code?: undefined;
    } | {
        code: RCode;
        msg: string;
        data: any;
    }>;
    postUsers(userIds: string): Promise<{
        msg: string;
        data: any[];
        code?: undefined;
    } | {
        code: RCode;
        msg: string;
        data: any;
    }>;
    updateUserName(user: User): Promise<{
        code: number;
        msg: string;
        data: string;
    } | {
        msg: string;
        data: any;
        code?: undefined;
    } | {
        code: RCode;
        msg: string;
        data: any;
    }>;
    updatePassword(user: User, password: string): Promise<{
        msg: string;
        data: any;
        code?: undefined;
    } | {
        code: RCode;
        msg: string;
        data: any;
    }>;
    jurisdiction(userId: string): Promise<{
        msg: string;
        data: any;
    }>;
    delUser(uid: string, psw: string, did: string): Promise<{
        msg: string;
        code?: undefined;
        data?: undefined;
    } | {
        code: RCode;
        msg: string;
        data?: undefined;
    } | {
        code: RCode;
        msg: string;
        data: any;
    }>;
    getUsersByName(username: string): Promise<{
        data: User[];
        code?: undefined;
        msg?: undefined;
    } | {
        code: RCode;
        msg: string;
        data: any;
    }>;
    setUserAvatar(user: User, file: any): Promise<{
        msg: string;
        data: User;
        code?: undefined;
    } | {
        code: RCode;
        msg: string;
        data?: undefined;
    }>;
}
