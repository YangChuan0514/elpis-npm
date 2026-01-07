import MD5 from "md5";
import { ElMessage } from "element-plus";

/**
 * 封装前端请求方法 curl
 * @param {object} options 请求参数
 */
const curl  = ({
  url, 
  method = 'GET',
  headers = {},
  query = {},
  data = {},
  responseType = 'json',
  timeout = 60000,
  errorMsg = '网络异常',
}) => {
  // 处理请求参数为 axios 对应的格式
  const httpSetting = {
    url,
    method,
    params: query,
    data,
    responseType,
    timeout,
  };

  // 接口签名
  const st = Date.now();
  const signatrue = MD5(`${options.apiSignKey}_${st}`);

  const newHeaders = {
    ...headers,
    s_sign: signatrue,
    s_t: st,
  }
  if (url.indexOf('/api/proj/') > -1 && window.projKey && !(window.projKey instanceof HTMLElement)) {
    newHeaders.proj_key = window.projKey;
  }

  httpSetting.headers = newHeaders;

  return axios.request(httpSetting).then((response) => {
    const { success } = response.data || {};
    // 请求失败
    
    if (!success) {
      const { code, message } = response.data || {};
      if (code === 442) {
        ElMessage.error('请求参数错误！');
      } else if (code === 445) {
        ElMessage.error('请求不合法！');
      } else if (code === 446) {
        ElMessage.error('确实项目必要参数！');
      } else if (code === 50000) {
        ElMessage.error(message || '网络错误！');
      } else {
        ElMessage.error(message || errorMsg);
      }
      return Promise.resolve({
        success,
        message: message || errorMsg,
        code: code || 500,
      });
    }
    // 请求成功
    const { data, metadata } = response.data || {};
    return Promise.resolve({
      success,
      data,
      metadata,
    });
  }).catch((error) => {
    const { message } = error;
    // 1.超时处理
    if (/timeout/.test(message)) {
      return Promise.resolve({
        message: 'Request timeout',
        code: 504,
      })
    }
    // 2.其他错误处理
    // 3.默认处理
    return Promise.resolve(error);
  })
}

export default curl;