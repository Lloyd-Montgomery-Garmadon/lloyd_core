import mysql from 'mysql2/promise';
import {Env} from "./env";
import logger from "./log";

export interface DbConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    connectionLimit?: number; // 连接池最大连接数，默认可不传
}

/**
 * 数据库连接管理类
 * 通过配置参数创建连接池，封装常用数据库操作
 */
export class Database {
    private readonly pool: mysql.Pool;
    private readonly config: DbConfig;

    /**
     * 构造函数
     * @param config 数据库配置参数
     */
    constructor(config: DbConfig) {
        this.config = config;
        this.pool = mysql.createPool(this.config);

        logger.debug(`[Database] 初始化数据库连接池，配置: ${JSON.stringify(this.config)}`);
    }

    /**
     * 通过 Env 实例读取环境变量自动创建 Database 实例的工厂方法
     * @param env Env 实例
     */
    static fromEnv(env: Env): Database {
        const config: DbConfig = {
            host: env.get('DB_HOST', 'localhost', true),
            port: env.getNumber('DB_PORT', 3306, true),
            user: env.get('DB_USER', '', true),
            password: env.get('DB_PASSWORD', '', true),
            database: env.get('DB_NAME', '', true),
            connectionLimit: env.getNumber('DB_CONNECTION_LIMIT', 10)
        };
        return new Database(config);
    }

    /**
     * 获取数据库连接池实例
     */
    getPool(): mysql.Pool {
        return this.pool;
    }

    /**
     * 执行 SQL 查询，自动获取和释放连接
     * @param sql SQL 语句
     * @param params 可选参数数组
     * @returns 查询结果和字段信息
     */
    async query<T extends mysql.ResultSetHeader = any>(sql: string, params?: any[]): Promise<[T[], mysql.FieldPacket[]]> {
        const [rows, fields] = await this.pool.execute<T[]>(sql, params);
        return [rows, fields];
    }

    /**
     * 关闭连接池，释放所有资源
     */
    async close(): Promise<void> {
        await this.pool.end();
        logger.debug('[Database] 连接池已关闭');
    }
}
