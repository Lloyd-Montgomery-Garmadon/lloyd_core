import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import logger from "../../log";

interface ObjectExistsOptions {
    client: S3Client;
    bucket: string;
    key: string;
}

/**
 * 检查指定的对象是否存在于指定桶中，使用命名参数
 * @param options 配置参数
 * @returns 存在返回 true，不存在返回 false
 */
export async function objectExists(options: ObjectExistsOptions): Promise<boolean> {
    try {
        logger.debug(`[S3] 检查对象是否存在 - Bucket: ${options.bucket}, Key: ${options.key}`);
        await options.client.send(new HeadObjectCommand({ Bucket: options.bucket, Key: options.key }));
        logger.debug(`[S3] 对象存在: ${options.bucket}/${options.key}`);
        return true; // 对象存在且可访问
    } catch (error: any) {
        if (error.$metadata?.httpStatusCode === 404) {
            logger.debug(`[S3] 对象不存在: ${options.bucket}/${options.key}`);
            return false; // 对象不存在
        }
        if (error.$metadata?.httpStatusCode === 403) {
            logger.debug(`[S3] 对象存在但无权限访问: ${options.bucket}/${options.key}`);
            return true; // 对象存在但无权限访问，也算存在
        }
        logger.error(`[S3] 检查对象存在时出错: ${options.bucket}/${options.key}`, error);
        throw error; // 其他错误抛出
    }
}
