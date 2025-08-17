import * as crypto from 'crypto';

interface GenerateHashOptions {
    phone: string;
    prefix?: string;
    length?: number;
}


export class HashUtil {
    /**
     * 根据手机号生成短用户名（短哈希）
     * @param phone 手机号
     * @param prefix 用户名前缀，默认 'u_'
     * @param length 截取长度，默认 8
     * @returns 生成的短用户名
     */

    static generateHash({
                            phone,
                            prefix = 'u_',
                            length = 8,
                        }: GenerateHashOptions): string {
        const hash = crypto.createHash('md5').update(phone).digest('hex');
        return `${prefix}${hash.slice(0, length)}`;
    }

    /**
     * 对密码进行哈希
     * @param password 明文密码
     * @param salt 可选盐，如果不传则自动生成
     * @returns 返回 { hash, salt }
     */
    static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
        if (!salt) {
            // 生成随机盐，16字节
            salt = crypto.randomBytes(16).toString('hex');
        }
        const hash = crypto
            .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
            .toString('hex');
        return {hash, salt};
    }

    /**
     * 验证密码
     * @param password 用户输入明文密码
     * @param hash 数据库存储的 hash
     * @param salt 数据库存储的盐
     * @returns 是否匹配
     */
    static verifyPassword(password: string, hash: string, salt: string): boolean {
        const testHash = crypto
            .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
            .toString('hex');
        return testHash === hash;
    }
}
