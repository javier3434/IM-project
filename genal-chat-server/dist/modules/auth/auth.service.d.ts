import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import { GroupMap } from '../group/entity/group.entity';
export declare class AuthService {
    private readonly userRepository;
    private readonly groupUserRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, groupUserRepository: Repository<GroupMap>, jwtService: JwtService);
    login(data: User): Promise<any>;
    register(user: User): Promise<any>;
}
