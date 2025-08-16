import * as fs from 'fs';
import * as path from 'path';
import logger from "./log";
export class Env {
    // 保存所有环境变量键值对
    env: Record<string, any> = {};

    // 允许通过字符串索引访问属性，避免 TS 报错
    [key: string]: any;

    // 代理对象，实际返回给调用者的对象
    public proxy: any;

    /**
     * 构造函数，加载指定路径的 JSON 格式环境变量文件
     * 并将其合并到 process.env 中，优先使用文件变量
     * @param envFilePath JSON 格式的环境变量文件路径（可选）
     */
    constructor(envFilePath?: string) {
        if (envFilePath) {
            const fullPath = path.resolve(envFilePath);
            logger.debug(`[Env] 读取环境文件路径: ${fullPath}`);
            if (fs.existsSync(fullPath)) {
                const fileContent = fs.readFileSync(fullPath, 'utf-8');
                this.env = JSON.parse(fileContent);
                logger.debug('[Env] 读取到的环境变量:', this.env);
            } else {
                throw new Error(`[Env] 环境文件不存在: ${fullPath}`);
            }
        } else {
            logger.debug('[Env] 未指定环境文件，使用系统环境变量');
            this.env = process.env;
        }

        // 创建代理对象，实现属性动态访问
        this.proxy = new Proxy(this, {
            get(target, prop, receiver) {
                if (typeof prop === 'string') {
                    if (prop in target.env) {
                        // 打印访问日志
                        logger.debug(`[Env Proxy] 访问变量: ${prop} = ${target.env[prop]}`);
                        return target.env[prop];
                    }
                    // 支持访问原始类方法和属性
                    return Reflect.get(target, prop, receiver);
                }
                return undefined;
            },
        });

        // 返回代理对象，让用户可以通过 env.PORT 访问
        return this.proxy;
    }

    /**
     * 获取字符串类型环境变量
     * @param key 键名
     * @param defaultValue 默认值（可选）
     * @param required 是否必填，缺失则抛错（默认否）
     */
    get(key: string, defaultValue?: string, required = false): string {
        const val = this.env[key] ?? defaultValue;
        if (required && (val === undefined || val === '')) {
            throw new Error(`[Env] 缺少必填环境变量: ${key}`);
        }
        return val !== undefined && val !== null ? String(val) : '';
    }

    /**
     * 获取数字类型环境变量
     * @param key 键名
     * @param defaultValue 默认值（可选）
     * @param required 是否必填
     */
    getNumber(key: string, defaultValue?: number, required = false): number {
        const val = this.env[key] ?? defaultValue;
        if (required && (val === undefined || val === null)) {
            throw new Error(`[Env] 缺少必填环境变量: ${key}`);
        }
        const num = Number(val);
        if (isNaN(num)) {
            throw new Error(`[Env] 环境变量 ${key} 不是有效数字`);
        }
        return num;
    }

    /**
     * 获取布尔类型环境变量
     * @param key 键名
     * @param defaultValue 默认值（可选）
     * @param required 是否必填
     */
    getBoolean(key: string, defaultValue?: boolean, required = false): boolean {
        const val = this.env[key];
        if (val === undefined || val === null) {
            if (required) {
                throw new Error(`[Env] 缺少必填环境变量: ${key}`);
            }
            return defaultValue ?? false;
        }
        if (typeof val === 'boolean') {
            return val;
        }
        if (typeof val === 'string') {
            const lower = val.toLowerCase();
            return lower === 'true' || lower === '1' || lower === 'yes';
        }
        return Boolean(val);
    }
}
