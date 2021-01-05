import { Group } from '../group/entity/group.entity';
import { Repository } from 'typeorm';
export declare class ChatModule {
    private readonly groupRepository;
    constructor(groupRepository: Repository<Group>);
    onModuleInit(): Promise<void>;
}
