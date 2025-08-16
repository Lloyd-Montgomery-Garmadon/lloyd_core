import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import logger from "../../../log";

interface UploadParams {
    client: S3Client;
    data: Buffer;
    key: string;
    bucket: string;
}

/**
 * 上传文件到指定桶（命名参数）
 * @param params 上传参数对象
 */
export async function upload(params: UploadParams): Promise<void> {
    const { client, data, key, bucket } = params;

    if (!bucket) {
        throw new Error('上传失败：桶名不能为空');
    }
    if (!key) {
        throw new Error('上传失败：文件名不能为空');
    }

    try {
        const startTime = Date.now();  // 记录开始时间
        logger.debug("上传开始时间:", new Date().toISOString());

        await client.send(
            new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: data,
            })
        );

        const endTime = Date.now();
        const duration = endTime - startTime;

        logger.debug("上传结束时间:", new Date(endTime).toISOString());
        logger.debug(`文件 ${key} 上传成功到桶 ${bucket}，耗时: ${duration} ms`);
    } catch (error) {
        logger.error(`上传文件 ${key} 到桶 ${bucket} 失败:`, error);
        throw error;
    }
}
