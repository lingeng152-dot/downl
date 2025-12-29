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

    // 1. 自动清洗：从那一大堆文字里精准提取 http 链接
    const linkMatch = url.match(/https?:\/\/[^\s]+/g);
    const cleanUrl = linkMatch ? linkMatch[0].split(' ')[0] : url;

    try {
      // 2. 使用目前最坚挺的去水印解析网关（针对抖音、小红书特别优化）
      const res = await fetch(`https://api.discut.ltd/api/video?url=${encodeURIComponent(cleanUrl)}`);
      const result = await res.json();

      // 3. 适配多种可能的返回格式
      if (result && (result.url || result.data?.url)) {
        const videoInfo = result.data || result;
        setData({
          title: videoInfo.title || "视频解析成功",
          cover: videoInfo.cover || videoInfo.thumbnail || "https://via.placeholder.com/400x225?text=Video+Ready",
          url: videoInfo.url || videoInfo.video_url
        });
      } else {
        // 方案 B: 备用万能解析
        const resB = await fetch(`https://api.boxv.cc/api/all?url=${encodeURIComponent(cleanUrl)}`);
        const jsonB = await resB.json();
        if (jsonB && jsonB.url) {
          setData({
            title: jsonB.title || "视频已解析",
            cover: jsonB.cover || "https://via.placeholder.com/400x225?text=Video+Ready",
            url: jsonB.url
          });
        } else {
          alert("该视频受限或接口正在维护，请稍后再试");
        }
      }
    } catch (e) {
      alert("网络连接失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Social Saver - 极简万能下载</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="main">
        <h1 className="logo">SOCIAL SAVER</h1>
        <p className="hint">粘贴抖音/X/小红书链接，自动去水印</p >

        <div className="input-box">
          <textarea 
            rows="3"
            placeholder="在此粘贴带文字的分享链接..." 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
          />
          <button onClick={handleParse} disabled={loading}>
            {loading ? <div className="spinner"></div> : '立即解析视频'}
          </button>
        </div>

        {data && (
          <div className="result-card">
            <div className="preview-container">
              < img src={data.cover} alt="thumbnail" />
            </div>
            <div className="actions">
              <p className="video-title">{data.title}</p >
              <a href= "_blank" rel="noreferrer" className="download-button">
                打开原片 · 长按保存
              </a >
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        body { margin: 0; background: #050505; color: #fff; font-family: -apple-system, system-ui, sans-serif; }
        .container { min-height: 100vh; display: flex; justify-content: center; padding: 20px; box-sizing: border-box; }
        .main { width: 100%; max-width: 440px; margin-top: 40px; }
        .logo { font-size: 2.2rem; font-weight: 900; letter-spacing: -2px; margin: 0; text-align: center; }
        .hint { color: #666; text-align: center; margin: 10px 0 30px; font-size: 0.9rem; }
        .input-box { background: #111; border: 1px solid #222; border-radius: 20px; padding: 15px; }
        textarea { width: 100%; background: transparent; border: none; color: #fff; font-size: 1rem; resize: none; outline: none; margin-bottom: 10px; }
        button { width: 100%; background: #fff; color: #000; border: none; padding: 16px; border-radius: 14px; font-weight: 800; cursor: pointer; display: flex; justify-content: center; }
        button:active { transform: scale(0.98); }
        .result-card { margin-top: 25px; background: #111; border-radius: 20px; overflow: hidden; border: 1px solid #222; animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .preview-container { width: 100%; aspect-ratio: 16/9; background: #000; }
        img { width: 100%; height: 100%; object-fit: cover; }
        .actions { padding: 20px; }
        .video-title { font-size: 0.9rem; color: #aaa; margin: 0 0 15px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .download-button { display: block; background: #0070f3; color: #fff; text-align: center; padding: 15px; border-radius: 12px; text-decoration: none; font-weight: bold; }
        .spinner { width: 20px; height: 20px; border: 3px solid #ccc; border-top-color: #000; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
