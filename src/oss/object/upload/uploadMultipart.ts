import {
    AbortMultipartUploadCommand,
    CompleteMultipartUploadCommand,
    CreateMultipartUploadCommand,
    S3Client,
    UploadPartCommand,
} from "@aws-sdk/client-s3";
import logger from "../../../log";

interface UploadMultipartBufferParams {
    client: S3Client;
    bucket: string;
    key: string;
    fileData: Buffer | Uint8Array;
    partSize?: number; // 可选，默认5MB
}

/**
 * 分片上传文件（支持直接传入文件数据，不依赖本地路径）
 * @param params 参数对象
 */
export async function uploadMultipartBuffer(params: UploadMultipartBufferParams): Promise<void> {
    const {client, bucket, key, fileData, partSize = 5 * 1024 * 1024} = params;

    logger.debug("开始上传", key);

    const startTime = Date.now();  // 上传开始时间

    // 1. 创建上传任务
    const createRes = await client.send(
        new CreateMultipartUploadCommand({
            Bucket: bucket,
            Key: key,
        })
    );

    if (!createRes.UploadId) {
        throw new Error("无法获取 UploadId");
    }

    const uploadId = createRes.UploadId;
    logger.debug("UploadId:", uploadId);

    const fileSize = fileData.length;
    const parts: { ETag?: string; PartNumber: number }[] = [];

    try {
        let offset = 0;
        for (let partNumber = 1; offset < fileSize; partNumber++) {
            const chunkSize = Math.min(partSize, fileSize - offset);
            const chunk = fileData.slice(offset, offset + chunkSize);

            const uploadPartRes = await client.send(
                new UploadPartCommand({
                    Bucket: bucket,
                    Key: key,
                    UploadId: uploadId,
                    PartNumber: partNumber,
                    Body: chunk,
                })
            );

            parts.push({ETag: uploadPartRes.ETag, PartNumber: partNumber});

            logger.debug(`上传分片 ${partNumber}, 大小: ${chunkSize} bytes`);

            offset += chunkSize;
        }
    } catch (error) {
        logger.error("上传分片出错，准备中止上传", error);

        // 上传失败，取消上传任务
        await client.send(
            new AbortMultipartUploadCommand({
                Bucket: bucket,
                Key: key,
                UploadId: uploadId,
            })
        );

        throw error;
    }

    // 3. 完成上传
    await client.send(
        new CompleteMultipartUploadCommand({
            Bucket: bucket,
            Key: key,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: parts,
            },
        })
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    logger.debug("分片上传完成");
    logger.debug(`上传开始时间: ${new Date(startTime).toISOString()}`);
    logger.debug(`上传结束时间: ${new Date(endTime).toISOString()}`);
    logger.debug(`上传耗时: ${duration} ms`);
}

