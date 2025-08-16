import {CreateMultipartUploadCommand, S3Client} from "@aws-sdk/client-s3";
import logger from "../../../log";

/** ----------------------------
 * 1. 初始化分片上传，获得 UploadId
 * ---------------------------- */
interface CreateMultipartUploadParams {
    client: S3Client;   // S3 客户端实例
    bucket: string;     // 存储桶名称
    key: string;        // 对象路径（文件名）
}

export async function createMultipartUpload(params: CreateMultipartUploadParams) {
    const result = await params.client.send(
        new CreateMultipartUploadCommand({
            Bucket: params.bucket,
            Key: params.key,
        })
    );

    const uploadId = result.UploadId;
    logger.debug("CreateMultipartUpload success. UploadId:", uploadId, "Key:", params.key);

    return result;
}
