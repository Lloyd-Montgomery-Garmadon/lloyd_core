import { GetObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createWriteStream, WriteStream } from "fs";
import { Readable } from "stream";
import logger from "../../../log";

export type ProgressCallback = (downloadedBytes: number, totalBytes: number) => void;

interface DownloadMultipartOptions {
    client: S3Client;
    bucket: string;
    key: string;
    savePath: string;
    partSize?: number; // 单位字节，默认 5MB
    onProgress?: ProgressCallback;
}

export async function downloadObjectMultipartStreamWithProgress(options: DownloadMultipartOptions): Promise<void> {
    const partSize = options.partSize ?? 5 * 1024 * 1024; // 默认5MB

    // 获取文件总大小
    const headRes = await options.client.send(
        new HeadObjectCommand({ Bucket: options.bucket, Key: options.key })
    );
    const totalSize = headRes.ContentLength;
    if (totalSize === undefined) {
        throw new Error("无法获取文件大小");
    }

    // 创建写文件流
    const writeStream: WriteStream = createWriteStream(options.savePath, { flags: "w" });

    let offset = 0;
    let downloaded = 0;

    while (offset < totalSize) {
        const end = Math.min(offset + partSize - 1, totalSize - 1);
        logger.debug(`下载分片范围 bytes=${offset}-${end}`);

        const res = await options.client.send(
            new GetObjectCommand({
                Bucket: options.bucket,
                Key: options.key,
                Range: `bytes=${offset}-${end}`,
            })
        );

        const stream = res.Body as Readable;

        await new Promise<void>((resolve, reject) => {
            stream.on("error", reject);
            stream.on("end", () => resolve());

            stream.on("data", (chunk) => {
                downloaded += chunk.length;
                if (options.onProgress) {
                    options.onProgress(downloaded, totalSize);
                }
                const canWrite = writeStream.write(chunk);
                if (!canWrite) {
                    stream.pause();
                    writeStream.once("drain", () => stream.resume());
                }
            });
        });

        offset += partSize; // 修正：这里用局部变量 partSize
    }

    // 关闭写入流，确保写入完成
    await new Promise<void>((resolve, reject) => {
        writeStream.end(() => resolve());
        writeStream.on("error", reject);
    });

    logger.debug(`分片流式下载完成，文件保存到 ${options.savePath}`);
}
