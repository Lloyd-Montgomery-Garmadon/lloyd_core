import mysql from 'mysql2/promise';

import {Env} from '../env';
import logger from "../log";

export interface MySQLConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    connectionLimit?: number;
}

/**
 * MySQL 数据库连接管理类
 * - query(): 用于 SELECT，返回行数组
 * - execute(): 用于 INSERT/UPDATE/DDL，返回原始执行结果（OkPacket/ResultSetHeader 等）
 */
export class MySQLDatabase {
    private readonly pool: mysql.Pool;
    private readonly config: MySQLConfig;

    constructor(config: MySQLConfig) {
        this.config = config;
        this.pool = mysql.createPool(this.config);
        logger.debug(`[MySQLDatabase] 初始化数据库连接池，配置: ${JSON.stringify(this.config)}`);
    }

    static fromEnv(env: Env): MySQLDatabase {
        const config: MySQLConfig = {
            host: env.get('DB_HOST', 'localhost', true),
            port: env.getNumber('DB_PORT', 3306, true),
            user: env.get('DB_USER', '', true),
            password: env.get('DB_PASSWORD', '', true),
            database: env.get('DB_NAME', '', true),
            connectionLimit: env.getNumber('DB_CONNECTION_LIMIT', 10),
        };
        return new MySQLDatabase(config);
    }

    /**
     * query 用于 SELECT：返回行数组（T[]）
     * 示例： const rows = await db.query<{id:number, name:string}>('SELECT * FROM x WHERE y=?', [p])
     */
    async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
        const [rows] = await this.pool.query<any>(sql, params);
        return rows as T[];
    }

    /**
     * execute 用于 INSERT/UPDATE/DELETE/DDL：返回原始结果（OkPacket / ResultSetHeader）
     * 示例： const res = await db.execute('INSERT ...', [p])
     */
    async execute(sql: string, params?: any[]): Promise<any> {
        const [result] = await this.pool.execute<any>(sql, params);
        return result;
    }

    getPool(): mysql.Pool {
        return this.pool;
    }

    async close(): Promise<void> {
        await this.pool.end();
        logger.debug('[MySQLDatabase] 连接池已关闭');
    }
}
