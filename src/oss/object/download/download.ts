import {GetObjectCommand, S3Client, GetObjectCommandOutput} from "@aws-sdk/client-s3";
import {writeFile} from "fs/promises";
import logger from "../../../log";

/**
 * 下载参数配置接口，使用命名参数传递
 */
interface DownloadOptions {
    /** S3 客户端实例 */
    client: S3Client;
    /** 桶名称 */
    bucket: string;
    /** S3 对象键名（文件路径） */
    key: string;
    /** 本地保存路径，可选，默认使用 fileName */
    savePath?: string;
}

/**
 * 下载 S3 对象并保存到本地文件
 *
 * @param options 下载配置参数，使用命名参数对象传递
 *
 * @throws 下载失败时抛出异常
 */
export async function download(options: DownloadOptions): Promise<void> {
    try {
        logger.debug(`开始下载文件：${options.key}，来自桶：${options.bucket}`);

        // 发送 GetObject 请求，获取文件流
        const response: GetObjectCommandOutput = await options.client.send(
            new GetObjectCommand({Bucket: options.bucket, Key:options. key})
        );

        // 辅助函数：将可读流转成 Buffer
        const streamToBuffer = async (stream: ReadableStream | any): Promise<Buffer> => {
            const chunks: Uint8Array[] = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        };

        // 将响应体中的流转成 Buffer
        const buffer = await streamToBuffer(response.Body);

        // 如果没传本地保存路径，则默认用文件名
        const finalPath = options.savePath ?? options.key;

        // 写入文件
        await writeFile(finalPath, buffer);

        logger.debug(`文件下载成功，已保存到：${finalPath}`);
    } catch (error) {
        logger.error(`下载文件 ${options.key} 失败:`, error);
        throw error;
    }
}
