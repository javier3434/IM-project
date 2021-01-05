import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getUsers(userId: string): Promise<{
        msg: string;
        data: any;
        code?: undefined;
    } | {
        code: import("../../common/constant/rcode").RCode;
        msg: string;
        data: any;
    }>;
    postUsers(userIds: string): Promise<{
        msg: string;
        data: any[];
        code?: undefined;
    } | {
        code: import("../../common/constant/rcode").RCode;
        msg: string;
        data: any;
    }>;
    updateUserName(user: any): Promise<{
        code: number;
        msg: string;
        data: string;
    } | {
        msg: string;
        data: any;
        code?: undefined;
    } | {
        code: import("../../common/constant/rcode").RCode;
        msg: string;
        data: any;
    }>;
    updatePassword(user: any, password: any): Promise<{
        msg: string;
        data: any;
        code?: undefined;
    } | {
        code: import("../../common/constant/rcode").RCode;
        msg: string;
        data: any;
    }>;
    jurisdiction(userId: any): Promise<{
        msg: string;
        data: any;
    }>;
    delUser({ uid, psw, did }: {
        uid: any;
        psw: any;
        did: any;
    }): Promise<{
        msg: string;
        code?: undefined;
        data?: undefined;
    } | {
        code: import("../../common/constant/rcode").RCode;
        msg: string;
        data?: undefined;
    } | {
        code: import("../../common/constant/rcode").RCode;
        msg: string;
        data: any;
    }>;
    getUsersByName(username: string): Promise<{
        data: import("./entity/user.entity").User[];
        code?: undefined;
        msg?: undefined;
    } | {
        code: import("../../common/constant/rcode").RCode;
        msg: string;
        data: any;
    }>;
    setUserAvatar(user: any, file: any): Promise<{
        msg: string;
        data: import("./entity/user.entity").User;
        code?: undefined;
    } | {
        code: import("../../common/constant/rcode").RCode;
        msg: string;
        data?: undefined;
    }>;
}
