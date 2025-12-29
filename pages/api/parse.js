export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false });

  // 1. 自动提取真正的链接（解决你粘贴的那一长串乱码问题）
  const match = url.match(/https?:\/\/[^\s]+/g);
  const cleanUrl = match ? match[0] : url;

  try {
    // 方案：调用目前社区维护最勤的万能解析接口 (基于 yt-dlp 逻辑)
    // 这个接口专门处理短链接跳转和去水印
    const apiUrl = `https://api.boxv.cc/api/all?url=${encodeURIComponent(cleanUrl)}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
      }
    });

    const result = await response.json();

    // 适配返回的数据结构 (通用逻辑)
    if (result && (result.url || result.data?.url)) {
      const finalData = result.data || result;
      return res.status(200).json({
        success: true,
        data: {
          title: finalData.title || "解析成功",
          cover: finalData.cover || finalData.thumbnail,
          url: finalData.url || finalData.video_url
        }
      });
    }

    res.status(400).json({ success: false, message: "解析节点暂时离线" });
  } catch (error) {
    res.status(500).json({ success: false, error: "连接解析器超时" });
  }
}
