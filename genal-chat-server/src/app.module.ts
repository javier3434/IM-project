import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { ChatModule } from './modules/chat/chat.module';
import { FriendModule } from './modules/friend/friend.module';
import { GroupModule } from './modules/group/group.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // mysql -u root -p 登录数据库
    // create  database cAuth 创建一个数据库
    // use cAuth
    // show tables
    // desc book    展示表信息
    // select * from book
    //注意node和mysql的一个问题:node 使用mysqljs链接Mysql数据库时报以下错误，原因是mysql8.0更改了密码默认的认证插件为Caching_sha2_password，原来是mysql_native_password，更改密码为mysql_native_password认证就可以了
    // Error: ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server; consider upgrading MySQL client
    // USE chat(database name);
    // ALTER user'root'@'%' IDENTIFIED WITH mysql_native_password BY 'your password';
    TypeOrmModule.forRoot({
      type: 'mysql',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'chat',
      charset: 'utf8mb4', // 设置chatset编码为utf8mb4
      autoLoadEntities: true,
      synchronize: true,
    }),
    UserModule,
    ChatModule,
    FriendModule,
    GroupModule,
    AuthModule,
  ],
  controllers: [], //也可以在这直接引入对应的controller
  providers: [],
})
export class AppModule {}
