"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordVerify = exports.nameVerify = void 0;
function nameVerify(name) {
    const nameReg = /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
    if (name.length === 0) {
        return false;
    }
    if (!nameReg.test(name)) {
        return false;
    }
    return true;
}
exports.nameVerify = nameVerify;
function passwordVerify(password) {
    console.log(password);
    const passwordReg = /^\w+$/gis;
    if (password.length === 0) {
        return false;
    }
    if (!passwordReg.test(password)) {
        return false;
    }
    return true;
}
exports.passwordVerify = passwordVerify;
//# sourceMappingURL=utils.js.map