import {S3Client, CreateBucketCommand} from "@aws-sdk/client-s3";
import {bucketExists} from "./exist";
import logger from "../../log";


/**
 * 创建 S3 桶
 * @param client S3 客户端实例
 * @param bucket 要创建的桶名称
 */
export async function createBucket(
    client: S3Client,
    bucket: string
): Promise<void> {
    try {
        const exists = await bucketExists(client, bucket);
        if (exists) {
            logger.debug(`桶 ${bucket} 已存在，无需创建`);
            return;
        }

        await client.send(new CreateBucketCommand({ Bucket: bucket }));
        logger.debug(`桶 ${bucket} 创建成功`);
    } catch (error) {
        logger.error(`创建桶 ${bucket} 失败:`, error);
        throw error;
    }
}
