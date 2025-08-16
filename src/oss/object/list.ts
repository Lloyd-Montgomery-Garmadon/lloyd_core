import {ListObjectsV2Command, S3Client} from "@aws-sdk/client-s3";
import logger from "../../log";

export interface ListObjectsPageResult {
    files: { key?: string; size?: number }[];  // 当前页文件列表，数组元素包含 key 和 size 属性
    currentCount: number;                      // 当前请求返回的文件数量（KeyCount）
    isTruncated: boolean;                      // 是否还有下一页，true 表示有下一页
    nextContinuationToken?: string;            // 下一页的分页令牌（如果有下一页）
    totalObjectCount?: number                  // 总文件数量（此处逻辑可能有误，见下说明）
}

export interface ListObjectsPageOptions {
    client: S3Client;               // AWS S3 客户端实例，用于发送请求
    bucket: string;                // 需要列出的桶名称
    maxKeys?: number;              // 每页最大返回文件数量，默认不传即 AWS 默认最大 1000
    continuationToken?: string;    // 分页令牌，用于翻页
}

/**
 * 分页列出指定桶的文件列表
 *
 * @param option 配置参数，采用命名参数对象方式
 * @returns 当前页文件列表和分页信息
 *
 * @throws 请求失败时抛出异常
 */
export async function listObjectsPage(
    option: ListObjectsPageOptions
): Promise<ListObjectsPageResult> {
    try {
        // 发送请求，获取当前分页的对象列表
        const res = await option.client.send(
            new ListObjectsV2Command({
                Bucket: option.bucket,
                MaxKeys: option.maxKeys,
                ContinuationToken: option.continuationToken,
            })
        );

        // 额外请求：获取桶中文件数（此处调用了同一个接口但没有翻页累加，实际并不能准确统计总文件数）
        const totalObjectCount = await option.client.send(new ListObjectsV2Command({
            Bucket: option.bucket,
        }));

        // 解析当前页返回的文件列表，提取 key 和 size
        const files = (res.Contents || []).map(obj => ({
            key: obj.Key,
            size: obj.Size,
        }));

        // 当前页实际返回的文件数量
        const currentCount = res.KeyCount ?? 0;
        // 是否有下一页
        const isTruncated = res.IsTruncated ?? false;

        // 日志输出当前桶信息及本次请求返回文件数
        logger.debug(`桶 ${option.bucket} 共有${totalObjectCount.MaxKeys}个文件 当前请求返回文件数: ${currentCount}`);
        logger.debug(`当前页文件列表（共${files.length}个文件）：`, JSON.stringify(files, null, 2));

        // 返回分页结果，包括文件列表、分页状态、下一页令牌、总文件数（此处是 totalObjectCount.MaxKeys，可能并非总数）
        return {
            files,
            currentCount,
            isTruncated,
            nextContinuationToken: isTruncated ? res.NextContinuationToken : undefined,
            totalObjectCount: totalObjectCount.MaxKeys
        };
    } catch (error) {
        // 失败时打印错误日志并抛出异常
        logger.error(`列出桶 ${option.bucket} 文件失败:`, error);
        throw error;
    }
}
