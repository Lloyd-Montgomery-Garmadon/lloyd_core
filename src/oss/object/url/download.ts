import {S3Client, GetObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import logger from "../../../log";


interface GetGetObjectCommandPresignedUrlParams {
    client: S3Client;
    bucket: string;
    key: string;
    expiresIn?: number; // 秒，默认600秒（10分钟）
}

/**
 * 生成预签名 URL，默认 10 分钟过期
 * @param params 参数对象
 */
export async function getGetObjectPresignedUrl(params: GetGetObjectCommandPresignedUrlParams): Promise<string> {
    const {client, bucket, key, expiresIn = 600} = params;

    try {
        const url = await getSignedUrl(
            client,
            new GetObjectCommand({Bucket: bucket, Key: key}),
            {expiresIn}
        );
        logger.debug(`生成下载${key}预签名 URL: ${url}`);
        return url;
    } catch (error) {
        logger.error(`生成文件下载 ${key} 预签名 URL 失败:`, error);
        throw error;
    }
}
