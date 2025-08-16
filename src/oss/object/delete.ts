import {
    DeleteObjectCommand,
    S3Client
} from "@aws-sdk/client-s3";
import logger from "../../log";


interface DeleteObjectOptions {
    client: S3Client;
    bucket: string;
    key: string;
}

/**
 * 删除指定桶里的文件，使用命名参数
 * @param options 删除配置
 */
export async function deleteObject(options: DeleteObjectOptions): Promise<void> {
    try {
        await options.client.send(new DeleteObjectCommand({ Bucket: options.bucket, Key: options.key }));
        logger.debug(`文件 ${options.key} 已从桶 ${options.bucket} 删除`);
    } catch (error) {
        logger.error(`删除文件 ${options.key} 失败:`, error);
        throw error;
    }
}
