export class TimeUtil {
    static getTimestamp(): number {
        return Math.floor(Date.now() / 1000);
    }
}
