import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // 導入你的 App 組件

// 如果你的項目中有全局的 index.css，可以保留這行
// import './index.css'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);