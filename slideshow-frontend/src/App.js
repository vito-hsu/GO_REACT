import React from 'react';
import axios from 'axios';
import './App.css'; // 引入 App 组件的 CSS
import './components/Slideshow.css'; // **在這裡引入 Slideshow 的 CSS，確保它被加載**
import Slideshow from './components/Slideshow'; // 引入 Slideshow 组件
// Slideshow.js 和 App.js

const API_BASE_URL = 'https://go-slideshow-backend.onrender.com/api';

function App() {
  // 图片上传功能依然放在 App 组件中
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('圖片上傳成功！幻燈片將自動更新。');
      // 上傳成功後，我們不直接更新 Slideshow 的 state，而是讓 Slideshow 自己重新獲取圖片
      // 實際應用中，你可能需要一個更好的機制來通知 Slideshow 刷新圖片列表
    } catch (error) {
      console.error('圖片上傳失敗:', error);
      alert('圖片上傳失敗！');
    }
  };

  return (
    <div className="App">
      <h1 className="title">Go + React 幻燈片</h1>

      {/* 圖片上傳區域 */}
      <div style={{ marginBottom: '20px' }}>
        <h2 className="subtitle">上傳圖片</h2>
        <input type="file" accept="image/*" onChange={handleFileUpload} className="file-input" />
      </div>

      {/* 引入 Slideshow 組件 */}
      <Slideshow />
    </div>
  );
}

export default App;