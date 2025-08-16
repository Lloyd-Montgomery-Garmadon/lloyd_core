import chalk from 'chalk';

/** 日志等级枚举，定义日志的严重程度 */
export enum LogLevel {
    DEBUG, // 调试信息，最详细
    INFO,  // 普通运行信息
    WARN,  // 警告信息，可能存在的问题
    ERROR, // 错误信息，程序异常
}

/**
 * 日志配置选项接口
 */
interface LoggerOptions {
    tag?: string;          // 日志标签，用于标识模块，默认 "global"
    level?: LogLevel;      // 日志打印最低等级，默认 DEBUG
}

/**
 * Logger 类，只支持彩色控制台输出，不写文件
 * 增加了写入锁，避免并发写日志导致的错误
 */
export class Logger {
    private readonly tag: string;
    private readonly level: LogLevel;
    private writeLock = Promise.resolve(); // 写入队列锁，保证顺序写入

    constructor(options: LoggerOptions = {}) {
        this.tag = options.tag ?? 'global';
        this.level = options.level ?? LogLevel.DEBUG;
    }

    private getTimestamp() {
        return new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'});
    }

    private formatAny(data: any): string {
        if (data instanceof Error) return data.stack || data.message;
        if (data instanceof Map) {
            const obj: Record<string, any> = {};
            for (const [k, v] of data.entries()) obj[String(k)] = v;
            try {
                return JSON.stringify(obj, null, 2);
            } catch {
                return String(data);
            }
        }
        if (data instanceof Set) {
            try {
                return JSON.stringify(Array.from(data), null, 2);
            } catch {
                return String(data);
            }
        }
        if (typeof data === 'object' && data !== null) {
            try {
                return JSON.stringify(data, null, 2);
            } catch {
                return String(data);
            }
        }
        return String(data);
    }

    private getColorFunc(level: LogLevel) {
        switch (level) {
            case LogLevel.DEBUG:
                return chalk.greenBright.bold;
            case LogLevel.INFO:
                return chalk.blueBright.bold;
            case LogLevel.WARN:
                return chalk.yellowBright.bold;
            case LogLevel.ERROR:
                return chalk.redBright.bold;
            default:
                return chalk.white;
        }
    }

    private hashStringToNumber(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        return hash >>> 0;
    }

    private stringToRgbColor(str: string): string {
        const hash = this.hashStringToNumber(str);
        const r = (hash & 0xff0000) >> 16;
        const g = (hash & 0x00ff00) >> 8;
        const b = hash & 0x0000ff;
        const fixColor = (c: number) => Math.floor(c / 2) + 64;
        return `#${fixColor(r).toString(16).padStart(2, '0')}${fixColor(g).toString(16).padStart(2, '0')}${fixColor(b).toString(16).padStart(2, '0')}`;
    }

    /**
     * 核心日志写入，带写入锁，保证写入顺序且避免并发写冲突
     */
    private log(level: LogLevel, ...args: any[]) {
        if (level < this.level) return;

        const colorFunc = this.getColorFunc(level);
        const timestamp = this.getTimestamp();
        const levelName = LogLevel[level];
        const tagColor = this.stringToRgbColor(this.tag);
        const tagColored = chalk.hex(tagColor)(this.tag);
        const formatted = args.map(a => this.formatAny(a)).join(' ');

        // 写入队列串行执行，避免多并发写入时管道冲突
        this.writeLock = this.writeLock.then(() => {
            return new Promise<void>((resolve) => {
                try {
                    console.log(`[${chalk.green(timestamp)}] [${colorFunc(levelName)}] [${tagColored}] ${formatted}`);
                } catch (err) {
                    // 捕获日志写入异常，防止程序崩溃
                    // 可以考虑打印到 stderr 或做其他降级处理
                }
                resolve();
            });
        });
    }

    debug(...args: any[]) {
        this.log(LogLevel.DEBUG, ...args);
    }

    info(...args: any[]) {
        this.log(LogLevel.INFO, ...args);
    }

    warn(...args: any[]) {
        this.log(LogLevel.WARN, ...args);
    }

    error(...args: any[]) {
        this.log(LogLevel.ERROR, ...args);
    }
}

const logger = new Logger({tag: 'core'});

export default logger;