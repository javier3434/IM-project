interface GroupDto {
    groupId: string;
    userId: string;
    groupName: string;
    notice: string;
    messages?: GroupMessageDto[];
    createTime: number;
}
interface GroupMessageDto {
    userId: string;
    groupId: string;
    content: string;
    width?: number;
    height?: number;
    messageType: string;
    time: number;
}
interface FriendDto {
    userId: string;
    username: string;
    avatar: string;
    role?: string;
    tag?: string;
    messages?: FriendMessageDto[];
    createTime: number;
}
interface FriendMessageDto {
    userId: string;
    friendId: string;
    content: string;
    width?: number;
    height?: number;
    messageType: string;
    time: number;
}
