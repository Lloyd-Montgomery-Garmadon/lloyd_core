import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';

export class FileUtils {
    /**
     * 异步读取文件，重载签名
     * @param filePath 文件路径
     * @param encoding 编码格式，如 'utf-8'，不传返回 Buffer
     * @returns 返回文件内容字符串或 Buffer
     */
    static async readFileAsync(filePath: string, encoding: BufferEncoding): Promise<string>;
    static async readFileAsync(filePath: string): Promise<Buffer>;

    /**
     * 异步读取文件实现
     * @param filePath 文件路径
     * @param encoding 编码格式，默认返回 Buffer
     * @returns 文件内容字符串或 Buffer
     */
    static async readFileAsync(filePath: string, encoding?: BufferEncoding): Promise<string | Buffer> {
        if (encoding) {
            return await fsp.readFile(filePath, {encoding});
        } else {
            return await fsp.readFile(filePath);
        }
    }

    /**
     * 同步读取文件，默认返回 utf-8 编码字符串
     * @param filePath 文件路径
     * @param encoding 编码格式，默认 'utf-8'
     * @returns 文件内容字符串
     */
    static readFileSync(filePath: string, encoding: BufferEncoding = 'utf-8'): string {
        return fs.readFileSync(filePath, {encoding});
    }

    /**
     * 异步写文件，存在则覆盖
     * @param filePath 文件路径
     * @param data 要写入的字符串或 Buffer 数据
     * @param encoding 编码格式，默认 'utf-8'
     */
    static async writeFileAsync(filePath: string, data: string | Buffer, encoding: BufferEncoding = 'utf-8'): Promise<void> {
        await fsp.writeFile(filePath, data, {encoding});
    }

    /**
     * 同步写文件，存在则覆盖
     * @param filePath 文件路径
     * @param data 要写入的字符串或 Buffer 数据
     * @param encoding 编码格式，默认 'utf-8'
     */
    static writeFileSync(filePath: string, data: string | Buffer, encoding: BufferEncoding = 'utf-8'): void {
        fs.writeFileSync(filePath, data, {encoding});
    }

    /**
     * 异步重命名文件或目录
     * @param oldPath 原始路径
     * @param newPath 新路径
     */
    static async renameAsync(oldPath: string, newPath: string): Promise<void> {
        await fsp.rename(oldPath, newPath);
    }

    /**
     * 同步重命名文件或目录
     * @param oldPath 原始路径
     * @param newPath 新路径
     */
    static renameSync(oldPath: string, newPath: string): void {
        fs.renameSync(oldPath, newPath);
    }

    /**
     * 异步删除文件
     * @param filePath 文件路径
     */
    static async deleteFileAsync(filePath: string): Promise<void> {
        await fsp.unlink(filePath);
    }

    /**
     * 同步删除文件
     * @param filePath 文件路径
     */
    static deleteFileSync(filePath: string): void {
        fs.unlinkSync(filePath);
    }

    /**
     * 异步判断文件是否存在
     * @param filePath 文件路径
     * @returns 是否存在，true 存在，false 不存在
     */
    static async existsAsync(filePath: string): Promise<boolean> {
        try {
            await fsp.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 同步判断文件是否存在
     * @param filePath 文件路径
     * @returns 是否存在，true 存在，false 不存在
     */
    static existsSync(filePath: string): boolean {
        try {
            fs.accessSync(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 异步获取文件大小，单位字节
     * @param filePath 文件路径
     * @returns 文件大小，字节数
     */
    static async getFileSizeAsync(filePath: string): Promise<number> {
        const stats = await fsp.stat(filePath);
        return stats.size;
    }

    /**
     * 同步获取文件大小，单位字节
     * @param filePath 文件路径
     * @returns 文件大小，字节数
     */
    static getFileSizeSync(filePath: string): number {
        const stats = fs.statSync(filePath);
        return stats.size;
    }

    /**
     * 获取文件扩展名（带点），如 ".txt"
     * @param filePath 文件路径
     * @returns 文件扩展名字符串
     */
    static getExtension(filePath: string): string {
        return path.extname(filePath);
    }
}
