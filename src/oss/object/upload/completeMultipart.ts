import {CompleteMultipartUploadCommand, S3Client} from "@aws-sdk/client-s3";
import logger from "../../../log";

/** ----------------------------
 * 3. 合并所有分片，完成上传
 * ---------------------------- */
interface CompleteMultipartUploadParams {
    client: S3Client;
    bucket: string;
    key: string;
    uploadId: string; // 同一个文件的 UploadId
    parts: { ETag: string; PartNumber: number }[]; // 所有分片信息
}

export async function completeMultipartUpload(params: CompleteMultipartUploadParams) {
    const result = await params.client.send(
        new CompleteMultipartUploadCommand({
            Bucket: params.bucket,
            Key: params.key,
            UploadId: params.uploadId,
            MultipartUpload: {
                Parts: params.parts, // 分片信息列表，必须按照 PartNumber 升序
            },
        })
    );

    logger.debug(
        "CompleteMultipartUpload success.",
        "UploadId:", params.uploadId,
        "File Key:", params.key,
        "PartsCount:", params.parts.length
    );

    return result;
}