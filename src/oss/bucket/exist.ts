import {S3Client, HeadBucketCommand} from "@aws-sdk/client-s3";
import logger from "../../log";

/**
 * 检查指定的 S3 桶是否存在且可访问
 *
 * @param client 已创建的 S3Client 实例
 * @param bucket 桶名称
 * @returns 存在返回 true，不存在返回 false
 * @throws 其他异常会被抛出，调用方需要捕获处理
 */
export async function bucketExists(client: S3Client, bucket: string): Promise<boolean> {
    logger.debug(`[bucketExists] 开始检查桶是否存在: ${bucket}`);

    try {
        await client.send(new HeadBucketCommand({Bucket: bucket}));
        logger.debug(`[bucketExists] 桶存在且可访问: ${bucket}`);
        return true;  // 桶存在且可访问
    } catch (error: any) {
        const statusCode = error?.$metadata?.httpStatusCode;
        logger.debug(`[bucketExists] 请求失败，状态码: ${statusCode}, 错误信息: ${error.message || error}`);

        if (statusCode === 404) {
            // 桶不存在
            logger.debug(`[bucketExists] 桶不存在: ${bucket}`);
            return false;
        }
        if (statusCode === 403) {
            // 桶存在但无权限访问，也可以认为是存在
            logger.debug(`[bucketExists] 桶存在但无权限访问，视为存在: ${bucket}`);
            return true;
        }
        // 其他错误抛出
        logger.error(`[bucketExists] 检查桶时发生未知错误: ${bucket}`, error);
        throw error;
    }
}
