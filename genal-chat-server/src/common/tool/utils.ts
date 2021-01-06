/**
 * 群名/用户名校验
 * @param name
 */
export function nameVerify(name: string): boolean {
  const nameReg = /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
  //不能以_开头或结尾,只能输入大小写字母,数字和汉字
  if (name.length === 0) {
    return false;
  }
  if (!nameReg.test(name)) {
    return false;
  }
  // if (name.length > 9) {
  //   return false;
  // }
  return true;
}

/**
 * 密码校验
 * @param password
 */
export function passwordVerify(password: string): boolean {
  console.log(password);
  const passwordReg = /^\w+$/gis;
  if (password.length === 0) {
    return false;
  }
  if (!passwordReg.test(password)) {
    return false;
  }
  // if (password.length > 9) {
  //   return false;
  // }
  return true;
}
