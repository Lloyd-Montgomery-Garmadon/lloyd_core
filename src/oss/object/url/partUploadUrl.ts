import {S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

interface GetPartSignedUrlParams {
    client: S3Client;
    command: any;         // UploadPartCommand 或 PutObjectCommand
    expiresIn?: number;   // 秒，默认600秒
}

export async function getPartSignedUrl(params: GetPartSignedUrlParams) {
    const {client, command, expiresIn = 600} = params;

    try {
        return await getSignedUrl(client, command, {expiresIn});
    } catch (error) {
        console.error("生成预签名 URL 失败:", error);
        throw error;
    }
}