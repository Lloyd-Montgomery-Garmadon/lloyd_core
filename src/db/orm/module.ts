import 'reflect-metadata';
import {MySQLDatabase} from "../mysql";

interface ModelClass<T> {
    new(): T;

    tableName: string;
    db: MySQLDatabase;
    columns: { property: string; column: string }[];
}

export class BaseModel {
    // 静态数据库连接实例
    static db: MySQLDatabase;

    // 使用装饰器时，可通过 Reflect 获取表名和列信息
    static get tableName(): string {
        return Reflect.getMetadata('tableName', this);
    }

    static get columns(): { property: string; column: string }[] {
        return Reflect.getMetadata('columns', this) || [];
    }

    // 注入数据库实例
    static useDatabase(db: MySQLDatabase) {
        this.db = db;
    }

    // 查询所有
    static async findAll<T extends BaseModel>(this: ModelClass<T>): Promise<T[]> {
        const rows = await this.db.query(`SELECT *
                                          FROM ${this.tableName}`);
        return rows.map(row => Object.assign(new this(), row));
    }

    // 条件查询单条
    static async findOne<T extends BaseModel>(this: ModelClass<T>, where: Record<string, any>): Promise<T | null> {
        const keys = Object.keys(where);
        const sql = `SELECT *
                     FROM ${this.tableName}
                     WHERE ${keys.map(k => `${k}=?`).join(' AND ')} LIMIT 1`;
        const rows = await this.db.query(sql, Object.values(where));
        return rows.length ? Object.assign(new this(), rows[0]) : null;
    }

    // 保存（新增或更新）
    async save(): Promise<void> {
        const ctor = this.constructor as ModelClass<this>;
        const cols = ctor.columns;
        const data: Record<string, any> = {};
        for (const { property, column } of cols) {
            let val = (this as any)[property];
            if (val === undefined) val = null;   // 这里转换 undefined 为 null
            data[column] = val;
        }

        try {
            if ((this as any).id) {
                // 更新
                const id = (this as any).id;
                delete data['id'];
                const keys = Object.keys(data);
                const sql = `UPDATE ${ctor.tableName} SET ${keys.map(k => `${k}=?`).join(',')} WHERE id=?`;
                await ctor.db.execute(sql, [...Object.values(data), id]);
            } else {
                // 插入
                const keys = Object.keys(data);
                const sql = `INSERT INTO ${ctor.tableName} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`;
                const result = await ctor.db.execute(sql, Object.values(data));
                (this as any).id = result.insertId;
            }
        } catch (error) {
            // 这里你可以判断 error.code 做不同处理
            // 也可以直接抛出，让调用处捕获
            throw error;
        }
    }

    async delete(): Promise<void> {
        const ctor = this.constructor as ModelClass<this>;
        if (!(this as any).id) throw new Error('No ID set');

        try {
            await ctor.db.execute(`DELETE FROM ${ctor.tableName} WHERE id = ?`, [(this as any).id]);
        } catch (error) {
            throw error;
        }
    }

}
