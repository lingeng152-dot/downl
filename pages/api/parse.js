export default async function handler(req, res) {
  const { url } = req.query;

  // 1. 自动清洗链接（去掉多余文字）
  const cleanUrl = url.match(/https?:\/\/[^\s]+/g)?.[0] || url;

  try {
    // 换用一个目前较火的开源免费解析分发器 (这是目前社区维护最勤的接口之一)
    const apiUrl = `https://api.tik.fail/api/analyze?url=${encodeURIComponent(cleanUrl)}`;
    
    const response = await fetch(apiUrl);
    const result = await response.json();

    // 适配不同的返回结构
    if (result && result.status === "success") {
      return res.status(200).json({
        success: true,
        data: {
          title: result.title || "解析成功",
          cover: result.thumbnail || result.cover,
          url: result.video_url || result.url,
        }
      });
    }

    // 如果第一个接口不行，尝试备用方案 (针对国内平台如抖音、小红书)
    const backupUrl = `https://api.douyin.wtf/api/video/?url=${encodeURIComponent(cleanUrl)}`;
    const backupRes = await fetch(backupUrl);
    const backupData = await backupRes.json();

    if (backupData && backupData.url) {
       return res.status(200).json({
        success: true,
        data: {
          title: "视频解析成功",
          cover: backupData.cover,
          url: backupData.url
        }
      });
    }

    res.status(400).json({ success: false, message: "所有接口解析失败" });
  } catch (error) {
    res.status(500).json({ success: false, error: "接口连接超时" });
  }
}
