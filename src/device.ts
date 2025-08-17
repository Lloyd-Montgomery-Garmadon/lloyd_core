export class DeviceUtil {
    static getDeviceType(userAgent: string): 'PC' | 'Mobile' {
        const mobileRegex =
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        return mobileRegex.test(userAgent) ? 'Mobile' : 'PC';
    }
}