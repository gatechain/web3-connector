export declare function parseChainId(chainId: string): number;
/**
 * 是否是AppView打开的页面
 */
export declare const isApp: (query: {
    device_type?: string;
}) => number | undefined;
/**
 * 解析URL查询参数为对象
 * @param search - URL查询字符串。如果不传则使用当前window.location.search
 * @returns 包含查询参数的对象
 * @example
 * // URL: https://example.com?name=test&age=18
 * const params = getQueryParams() // { name: 'test', age: '18' }
 *
 * // 或者传入自定义查询字符串
 * const params = getQueryParams('?token=123&type=1') // { token: '123', type: '1' }
 */
export declare function getQueryParams(search?: string): Record<string, string>;
