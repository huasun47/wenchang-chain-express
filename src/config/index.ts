// 先去 文昌链平台注册账户 https://console.avata.bianjie.ai/

// NFT 接口文档： https://stage.apis.avata.bianjie.ai/#tag/NFT

interface AvataConfigStruct {
  // API Key 用于网关鉴权
  apiKey: string;

  // API Secret 用于接口服务调用签名
  apiSecret: string;

  // API Url 是接口域名和公共前缀
  apiUrl: string;
}

interface Obj {
  [key: string]: any;
}

export const avata: AvataConfigStruct = {
  apiKey: "J212G1k0E2j8Z1J2g3l4X5P5h9M8o7fh",
  apiSecret: "l2M2x1A0k2c8s1W2w3f4c505B9L8m7bz",
  apiUrl: "https://stage.apis.avata.bianjie.ai",
};

export const axiosConfig: Obj = {};
