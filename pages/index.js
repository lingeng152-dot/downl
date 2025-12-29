import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const handleParse = async () => {
    if (!url) return;
    setLoading(true);
    setData(null);

    // 1. 自动清洗链接
    const match = url.match(/https?:\/\/[^\s]+/g);
    const cleanUrl = match ? match[0] : url;

    try {
      // 2. 直接调用目前最稳的三个公共解析网关（轮询尝试）
      // 方案 A: tik.fail (全球通用)
      // 方案 B: ddownr (X/Twitter 强项)
      // 方案 C: 专用去水印接口
      const res = await fetch(`https://api.tik.fail/api/analyze?url=${encodeURIComponent(cleanUrl)}`);
      const json = await res.json();

      if (json.status === "success" || json.url) {
        setData({
          title: json.title || "解析成功",
          cover: json.thumbnail || json.cover || "https://via.placeholder.com/400x200?text=Success",
          url: json.video_url || json.url
        });
      } else {
        // 如果 A 失败，尝试备用纯净接口
        const backupRes = await fetch(`https://api.p6p.net/api/video/?url=${encodeURIComponent(cleanUrl)}`);
        const backupJson = await backupRes.json();
        if(backupJson.code === 200) {
            setData({
                title: "视频解析成功",
                cover: backupJson.cover,
                url: backupJson.url
            });
        } else {
            alert("该链接受限或接口失效，请尝试其他视频");
        }
      }
    } catch (e) {
      alert("接口连接失败，请检查网络");
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <Head>
        <title>Social Saver - 极简下载</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      <div className="main">
        <h1 className="logo">SOCIAL SAVER</h1>
        <div className="input-group">
          <input type="text" placeholder="粘贴链接（支持 X / 抖音 / 小红书）" value={url} onChange={(e) => setUrl(e.target.value)} />
          <button onClick={handleParse} disabled={loading}>{loading ? '解析中...' : '开始'}</button>
        </div>
        {data && (
          <div className="card">
            < img src={data.cover} />
            <div className="info">
              <h3>{data.title}</h3>
              <a href= "_blank" rel="noreferrer" className="dl-btn">下载视频 / 长按保存</a >
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        body { margin: 0; background: #000; color: #fff; font-family: sans-serif; }
        .container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .main { width: 100%; max-width: 400px; text-align: center; }
        .logo { font-size: 2rem; font-weight: 900; margin-bottom: 30px; letter-spacing: -1px; }
        input { width: 100%; box-sizing: border-box; background: #111; border: 1px solid #222; padding: 15px; border-radius: 12px; color: #fff; margin-bottom: 10px; }
        button { width: 100%; background: #fff; color: #000; border: none; padding: 15px; border-radius: 12px; font-weight: bold; cursor: pointer; }
        .card { background: #111; margin-top: 20px; border-radius: 15px; overflow: hidden; border: 1px solid #222; }
        img { width: 100%; }
        .info { padding: 15px; text-align: left; }
        .dl-btn { display: block; background: #0070f3; color: #fff; text-decoration: none; text-align: center; padding: 12px; border-radius: 8px; font-weight: bold; }
      `}</style>
    </div>
  );
}
