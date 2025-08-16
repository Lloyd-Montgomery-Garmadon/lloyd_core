import logger from "./log";

export function hashStringToNumber(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // 转成32位整数
    }
    const unsignedHash = hash >>> 0; // 转成无符号整数
    logger.debug(`[hashStringToNumber] 输入字符串: "${str}", 计算hash: ${unsignedHash}`);
    return unsignedHash;
}

/**
 * 由字符串生成一个 RGB 颜色代码，格式如 '#a1b2c3'
 */
export function stringToRgbColor(str: string): string {
    const hash = hashStringToNumber(str);

    const r = (hash & 0xff0000) >> 16;
    const g = (hash & 0x00ff00) >> 8;
    const b = hash & 0x0000ff;

    const fixColor = (c: number) => Math.floor(c / 2) + 64; // 64~191

    const fr = fixColor(r);
    const fg = fixColor(g);
    const fb = fixColor(b);

    const color = `#${fr.toString(16).padStart(2, '0')}${fg.toString(16).padStart(2, '0')}${fb.toString(16).padStart(2, '0')}`;

    logger.debug(`[stringToRgbColor] 原RGB: (${r}, ${g}, ${b}), 修正RGB: (${fr}, ${fg}, ${fb}), 颜色代码: ${color}`);

    return color;
}
