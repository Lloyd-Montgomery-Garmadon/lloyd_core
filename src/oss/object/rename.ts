import {S3Client, CopyObjectCommand, DeleteObjectCommand} from "@aws-sdk/client-s3";
import logger from "../../log";
import {objectExists} from "./exist";


interface ObjectRenameOptions {
    client: S3Client;
    bucket: string;
    key: string;
    newKey: string
}

/**
 * 在 S3 桶中重命名对象（文件）
 * 注意：S3 本身没有重命名接口，此方法通过“复制 + 删除”实现
 * @param option 参数 实例
 */
export async function renameObject(
    option: ObjectRenameOptions
): Promise<void> {
    // 先判断目标文件是否已存在，避免覆盖
    const targetExists = await objectExists({client: option.client, bucket: option.bucket, key: option.newKey});
    if (targetExists) {
        throw new Error(`目标文件已存在，重命名失败: ${option.newKey}`);
    }

    try {
        // 复制原文件到新文件名
        await option.client.send(new CopyObjectCommand({
            Bucket: option.bucket,
            CopySource: encodeURIComponent(`${option.bucket}/${option.key}`),
            Key: option.newKey,
        }));

        // 删除原文件，完成重命名操作
        await option.client.send(new DeleteObjectCommand({
            Bucket: option.bucket,
            Key: option.key,
        }));

        logger.debug(`文件重命名成功: ${option.key} => ${option.newKey}`);
    } catch (error) {
        logger.error("文件重命名失败:", error);
        throw error;
    }
}
