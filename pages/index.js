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
    try {
      const res = await fetch(`/api/parse?url=${encodeURIComponent(url)}`);
      const json = await res.json();
      if (json.success) setData(json.data);
      else alert("解析不到内容，请检查链接");
    } catch (e) {
      alert("网络错误");
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <Head>
        <title>Social Saver - 全能下载</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="main">
        <h1 className="logo">SOCIAL SAVER</h1>
        <p className="subtitle">支持 X · 抖音 · 小红书</p >

        <div className="input-group">
          <input 
            type="text" 
            placeholder="粘贴分享链接..." 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button onClick={handleParse} disabled={loading}>
            {loading ? '解析中...' : '立即解析'}
          </button>
        </div>

        {data && (
          <div className="card">
            < img src={data.cover} alt="cover" />
            <div className="info">
              <h3>{data.title}</h3>
              <a href= "_blank" rel="noreferrer" className="dl-btn">
                保存视频 / 查看原片
              </a >
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        body { margin: 0; padding: 0; background: #000; color: #fff; font-family: -apple-system, sans-serif; }
        .container { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
        .main { width: 100%; maxWidth: 480px; text-align: center; }
        .logo { font-size: 2.5rem; font-weight: 800; letter-spacing: -2px; margin-bottom: 5px; }
        .subtitle { color: #666; margin-bottom: 40px; font-size: 0.9rem; }
        .input-group { position: relative; display: flex; flex-direction: column; gap: 12px; }
        input { background: #111; border: 1px solid #222; padding: 18px; border-radius: 16px; color: #fff; font-size: 1rem; outline: none; }
        input:focus { border-color: #444; }
        button { background: #fff; color: #000; border: none; padding: 18px; border-radius: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; }
        button:active { transform: scale(0.98); }
        .card { background: #111; margin-top: 30px; border-radius: 24px; overflow: hidden; border: 1px solid #222; animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        img { width: 100%; aspect-ratio: 16/9; object-fit: cover; }
        .info { padding: 20px; text-align: left; }
        h3 { margin: 0 0 15px 0; font-size: 1rem; font-weight: 400; line-height: 1.4; color: #ccc; }
        .dl-btn { display: block; background: #333; color: #fff; text-decoration: none; text-align: center; padding: 15px; border-radius: 12px; font-weight: bold; }
      `}</style>
    </div>
  );
}
