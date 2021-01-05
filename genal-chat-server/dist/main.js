"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logger_middleware_1 = require("./common/middleware/logger.middleware");
const response_interceptor_1 = require("./common/interceptor/response.interceptor");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(logger_middleware_1.logger);
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
    app.useStaticAssets(path_1.join(__dirname, '../public', '/'), {
        prefix: '/',
    });
    await app.listen(3000);
    console.log('====================================');
    console.log('临冬城IM 服务运行成功...http://localhost:3000');
    console.log('====================================');
}
bootstrap();
//# sourceMappingURL=main.js.map