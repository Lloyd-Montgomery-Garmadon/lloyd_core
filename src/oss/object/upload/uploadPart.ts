import {S3Client, UploadPartCommand} from "@aws-sdk/client-s3";
import logger from "../../../log";

/** ----------------------------
 * 2. 上传单个分片
 * ---------------------------- */
interface UploadPartParams {
    client: S3Client;
    bucket: string;
    key: string;
    uploadId: string;
    partNumber: number;
    body?: any;
    returnCommand?: boolean; // 是否返回 Command
}

export async function uploadPart(params: UploadPartParams) {
    const {client, bucket, key, uploadId, partNumber, body, returnCommand = false} = params;

    // 先创建 Command
    const command = new UploadPartCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
        Body: body,
    });

    // 可选：直接发送上传
    // const result = await client.send(command);

    logger.debug(
        "UploadPart success.",
        "UploadId:", uploadId,
        "PartNumber:", partNumber,
    );

    // 返回上传结果 + Command
    // if (returnCommand) {
    //     return {result, command};
    // }
    return command;
}

