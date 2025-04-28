export function parseChainId(chainId: string) {
  return Number.parseInt(chainId, 16);
}

/**
 * 是否是AppView打开的页面
 */
export const isApp = (query: { device_type?: string }): number | undefined => {
  if (query && query.device_type) return Number(query.device_type || 0);
  if (typeof window !== 'undefined' && (window as any).isWeb3App) {
    return 1;
  }
  return undefined;
};

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
export function getQueryParams(search?: string): Record<string, string> {
  // 如果没有传入search参数且在浏览器环境，则使用window.location.search
  const searchStr = search ?? (typeof window !== 'undefined' ? window.location.search : '');

  // 创建URLSearchParams对象来解析查询字符串
  const searchParams = new URLSearchParams(searchStr);

  // 将URLSearchParams转换为普通对象
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}
