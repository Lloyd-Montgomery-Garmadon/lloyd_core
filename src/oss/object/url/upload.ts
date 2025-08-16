import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import logger from "../../../log";

interface GetPutObjectCommandPresignedUrlParams {
    client: S3Client;
    bucket: string;
    key: string;
    expiresIn?: number; // 秒，默认600秒（10分钟）
}

export async function getPutObjectPresignedUrl(params: GetPutObjectCommandPresignedUrlParams): Promise<string> {
    const {client, bucket, key, expiresIn = 600} = params;

    try {
        const url = await getSignedUrl(
            client,
            new PutObjectCommand({Bucket: bucket, Key: key}),
            {expiresIn: expiresIn}
        );

        logger.debug(`生成上传${key}预签名 URL: ${url}`);
        return url;
    } catch (error) {
        logger.error(`生成文件上传 ${key} 预签名 URL 失败:`, error);
        throw error;
    }
}