export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, message: "Missing URL" });
  }

  try {
    // 这是一个稳定的公共解析接口
    const apiUrl = `https://api.hybridlab.io/api/social/autoguess?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (result && result.links && result.links.length > 0) {
      // 这里的逻辑会自动适配 X、抖音、小红书
      return res.status(200).json({
        success: true,
        data: {
          title: result.title || "已识别的视频",
          cover: result.thumbnail,
          url: result.links[0].link, // 最高清晰度地址
          platform: result.source
        }
      });
    }
    res.status(400).json({ success: false, message: "解析失败" });
  } catch (error) {
    res.status(500).json({ success: false, error: "服务器繁忙" });
  }
}
