import {S3Client} from "@aws-sdk/client-s3";
import {NodeHttpHandler} from "@smithy/node-http-handler";
import logger from "../log";

/**
 * S3 客户端配置选项接口
 */
export interface ClientOptions {
    endpoint: string;           // S3 服务地址，必须包含 http:// 或 https:// 前缀
    region: string;             // AWS 区域，例如 "us-east-1"
    accessKey: string;          // 访问密钥 ID
    secretKey: string;          // 访问密钥 Secret
    connectionTimeout?: number; // TCP 连接超时时间，单位毫秒，默认 3000ms
    requestTimeout?: number;    // 请求总超时时间，单位毫秒，默认 3000ms
    forcePathStyle?: boolean;   // 是否强制使用路径式访问（path-style），默认为 false
}

/**
 * 创建并返回一个配置好的 S3 客户端实例
 *
 * @param options 客户端配置选项，包含 endpoint、region、密钥及超时设置等
 * @returns 配置完成的 S3Client 实例
 */
export function createClient({
                                 endpoint,
                                 region,
                                 accessKey,
                                 secretKey,
                                 connectionTimeout = 3000,
                                 requestTimeout = 3000,
                                 forcePathStyle = false,
                             }: ClientOptions): S3Client {
    // 打印配置信息，方便调试和排查问题
    logger.debug("[S3Client] 创建客户端实例:");
    logger.debug(`  Endpoint          : ${endpoint}`);
    logger.debug(`  Region            : ${region}`);
    logger.debug(`  AccessKeyId       : ${accessKey}`);
    logger.debug(`  ConnectionTimeout : ${connectionTimeout} ms`);
    logger.debug(`  RequestTimeout    : ${requestTimeout} ms`);
    logger.debug(`  ForcePathStyle    : ${forcePathStyle}`);

    // 使用提供的参数创建并返回 S3Client 实例
    return new S3Client({
        endpoint: endpoint,                 // 自定义服务地址（支持 MinIO 等兼容 S3 的存储）
        region: region,                    // 指定 AWS 区域
        credentials: {                     // 设置访问凭证
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
        },
        forcePathStyle: forcePathStyle,   // 是否强制路径式访问
        requestHandler: new NodeHttpHandler({
            connectionTimeout: connectionTimeout,  // TCP 连接超时设置
            requestTimeout: requestTimeout,        // 请求超时设置
        }),
    });
}
