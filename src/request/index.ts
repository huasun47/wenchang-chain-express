import axios from "axios";

import { avata, axiosConfig } from "../config";
import { getAvataSignature } from "./signature";
import type { AxiosInstance } from "axios";

const opId = '0z3p2I415q2C4p9G0EimMZMnRTVSy5nOM9mHHsXM0zvO1FDgmx9';
const getOperationId = () => Date.now() + opId
/**
 * 创建一个独立的 Axios 实例
 * 把常用的公共请求配置放这里添加
 */
const instance = axios.create(axiosConfig);

instance.interceptors.request.use(
  // 正常拦截
  (config: any) => {
    // 处理 Avata API 配置，请求以 `/avata/xxx` 开头的都是 Avata API
    if (config.url.startsWith("/avata")) {

      if (config.data) {
        config.data.operation_id = getOperationId()
      }
      // 根据命令行的指定环境处理为完整的请求 URL
      config.url = config.url.replace("/avata", avata.apiUrl);

      // 添加请求头
      const timestamp = Date.now();
      config.headers["X-Api-Key"] = avata.apiKey;
      config.headers["X-Timestamp"] = timestamp;
      config.headers["X-Signature"] = getAvataSignature(config);
    }

    // 返回处理后的配置
    return Promise.resolve(config);
  },

  // 异常拦截
  (err) => Promise.reject(err)
);

instance.interceptors.response.use(
  function (response) {
    console.log(response)

    return Promise.resolve(response.data.data);
  },
  function (error) {
    console.log(error)
    return Promise.reject(error.response.data.error);
  }
);

export { instance as axios };
