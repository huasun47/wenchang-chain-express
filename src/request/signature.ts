import { SHA256 } from "crypto-js";
import { avata } from "../config";
import type { AxiosRequestConfig } from "axios";

interface Obj {
  [key: string]: any;
}

/**
 * 提取 URL 里的信息
 * @param fullUrl - 完整的 URL ，可能包含 ?a=1&b=2 后面的尾巴
 * @returns 一个包含请求路径和 Query 参数对象的对象
 *  `path`: 请求路径，仅截取域名后及 Query 参数前部分，例：`/v1beta1/accounts`
 *  `query`: Query 参数对象，会把 `key1=value1&key2=value2` 转为对象
 */
function extractUrlInfo(fullUrl: string): {
  path: string;
  query: Obj;
} {
  const [url, queryStr] = decodeURIComponent(fullUrl).split("?");

  // 去掉域名，拿到请求路径
  const path = url.startsWith("http")
    ? `/${url.split("/").slice(3).join("/")}`
    : url;

  // 提取 URL 后面的 Query 部分
  const query: Obj = {};
  if (queryStr) {
    const qArr = queryStr.split("&");
    qArr.forEach((q) => {
      const [k, v] = q.split("=");
      query[k] = v;
    });
  }

  return { path, query };
}

/**
 * 添加对象的键前缀
 * @param source - 需要处理的对象数据源
 * @param prefix - 需要添加的前缀
 * @param isParams - 是否 config.params 里的数据
 * @returns 处理后的对象
 */
function addKeyPrefix(source: Obj, prefix: string, isParams?: boolean) {
  const result: Obj = {};

  // Params 里的值需要处理为字符串
  // 见 https://github.com/bianjieai/opb-faq/issues/13
  for (const k in source) {
    if (Object.prototype.hasOwnProperty.call(source, k)) {
      result[`${prefix}_${k}`] = isParams ? String(source[k]) : source[k];
    }
  }

  return result;
}

/**
 * 对键进行排序
 * @description 签名还需要对键排序，否则会报 authentication failed
 * @see https://github.com/bianjieai/opb-faq/issues/60
 * @param target - 要排序的数据
 * @returns 排序结果
 *  对象：直接按照键排序后的新结果
 *  数组：如果里面是对象，也是会进行排序
 *  其他：原样返回
 */
function sortKeys(target: any): any {
  // 非数组和非对象，直接返回
  if (
    !Array.isArray(target) &&
    Object.prototype.toString.call(target) !== "[object Object]"
  ) {
    return target;
  }

  // 处理数组
  if (Array.isArray(target)) {
    return target.map((i) => sortKeys(i));
  }

  // 处理对象
  const keys = Object.keys(target).sort();
  const newObj: Obj = {};
  keys.forEach((k) => {
    newObj[k] = sortKeys(target[k]);
  });
  return newObj;
}

/**
 * 合并参数
 * @param path - 通过 extractUrlInfo 拿到的 Path 请求路径
 * @param query - 通过 extractUrlInfo 拿到的 Query 参数对象
 * @param params - 传入 config.params
 * @param data - 传入 config.data
 * @returns 对键进行了排序的合并结果
 */
function mergeParams(
  path: string,
  query: Obj = {},
  params: Obj = {},
  data: Obj = {}
): Obj {
  // 合并处理了键前缀的结果
  const originResult: Obj = {
    path_url: path,
    ...addKeyPrefix(query, "query"),
    ...addKeyPrefix(params, "query", true),
    ...addKeyPrefix(data, "body"),
  };

  // 对键进行排序
  const result = sortKeys(originResult);
  console.log("[libs/axios/signature]", JSON.stringify(result));

  return result;
}

/**
 * 获取 Avata API 的签名
 * @param config - Axios 的请求配置
 * @returns 按照 SHA256(Params+Timestamp+ApiSecret) 的算法生成的 API 签名
 */
export function getAvataSignature(config: AxiosRequestConfig): string {
  const { url, headers, params, data } = config;
  const { path, query } = extractUrlInfo(url as string);
  const sha256Data = mergeParams(path, query, params, data);
  const timestamp = headers ? headers["X-Timestamp"] : Date.now();
  const signature = String(
    SHA256(`${JSON.stringify(sha256Data)}${timestamp}${avata.apiSecret}`)
  );

  return signature;
}
