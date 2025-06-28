import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// Slideshow.js 和 App.js
const API_BASE_URL = 'https://go-slideshow-backend.onrender.com/api';
const IMAGE_BASE_URL = 'https://go-slideshow-backend.onrender.com/images';

function Slideshow() {
  const [images, setImages] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activeImage, setActiveImage] = useState(null);
  const [leavingImage, setLeavingImage] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState('slide-in');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showActive, setShowActive] = useState(false); // 控制 active 類的添加

  const slideshowRef = useRef(null);
  const transitionDuration = 1000;
  const slideshowInterval = 5000;

  // 動畫類型配置 - 增加更多效果
  const animationTypes = [
    'slide-in',
    'fade-in', 
    'from-left',
    'from-top',
    'from-bottom',
    'zoom-in',
    'zoom-out',
    'rotate-in',
    'flip-in'
  ];

  // 監聽全螢幕變化
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // 獲取圖片列表
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/images`);
        const imgs = res.data.images;
        setImages(imgs);
        if (imgs.length > 0) {
          setActiveImage(imgs[0]);
          // 第一張圖片直接顯示，不需要動畫
          setShowActive(true);
        }
      } catch (err) {
        console.error('Error fetching images:', err);
      }
    };
    fetchImages();
  }, []);

  // 切換圖片函數
  const switchImage = useCallback(() => {
    if (images.length === 0 || isTransitioning) return;

    setIsTransitioning(true);
    const nextIndex = (currentSlideIndex + 1) % images.length;
    const nextImage = images[nextIndex];

    // 隨機選擇動畫效果
    const randomAnimation = animationTypes[Math.floor(Math.random() * animationTypes.length)];
    
    console.log('切換到動畫:', randomAnimation); // 調試用

    // 第一步：隱藏當前圖片的 active 狀態
    setShowActive(false);
    setLeavingImage(activeImage);
    
    // 第二步：設置新圖片（但還沒有 active 類）
    setTimeout(() => {
      setActiveImage(nextImage);
      setCurrentSlideIndex(nextIndex);
      setCurrentAnimation(randomAnimation);
      
      // 第三步：添加 active 類觸發動畫
      setTimeout(() => {
        setShowActive(true);
      }, 50); // 短暫延遲確保 DOM 更新
      
    }, 100);

    // 第四步：清理離場圖片
    setTimeout(() => {
      setLeavingImage(null);
      setIsTransitioning(false);
    }, transitionDuration + 200);
    
  }, [images, currentSlideIndex, activeImage, isTransitioning, animationTypes]);

  // 自動播放邏輯
  useEffect(() => {
    if (isPaused || images.length === 0) return;
    
    const timer = setInterval(() => {
      switchImage();
    }, slideshowInterval);
    
    return () => clearInterval(timer);
  }, [isPaused, images, switchImage]);

  // 手動切換到下一張
  const handleNext = () => {
    if (!isTransitioning) {
      switchImage();
    }
  };

  // 手動切換到上一張
  const handlePrev = useCallback(() => {
    if (images.length === 0 || isTransitioning) return;

    setIsTransitioning(true);
    const prevIndex = currentSlideIndex === 0 ? images.length - 1 : currentSlideIndex - 1;
    const prevImage = images[prevIndex];

    const randomAnimation = animationTypes[Math.floor(Math.random() * animationTypes.length)];
    
    console.log('切換到動畫:', randomAnimation); // 調試用
    
    setShowActive(false);
    setLeavingImage(activeImage);
    
    setTimeout(() => {
      setActiveImage(prevImage);
      setCurrentSlideIndex(prevIndex);
      setCurrentAnimation(randomAnimation);
      
      setTimeout(() => {
        setShowActive(true);
      }, 50);
      
    }, 100);

    setTimeout(() => {
      setLeavingImage(null);
      setIsTransitioning(false);
    }, transitionDuration + 200);
    
  }, [images, currentSlideIndex, activeImage, isTransitioning, animationTypes]);

  // 全螢幕切換
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      slideshowRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen?.();
    }
  };

  // 跳轉到指定圖片
  const goToSlide = (index) => {
    if (index === currentSlideIndex || isTransitioning) return;
    
    setIsTransitioning(true);
    const targetImage = images[index];
    const randomAnimation = animationTypes[Math.floor(Math.random() * animationTypes.length)];
    
    console.log('跳轉到動畫:', randomAnimation); // 調試用
    
    setShowActive(false);
    setLeavingImage(activeImage);
    
    setTimeout(() => {
      setActiveImage(targetImage);
      setCurrentSlideIndex(index);
      setCurrentAnimation(randomAnimation);
      
      setTimeout(() => {
        setShowActive(true);
      }, 50);
      
    }, 100);

    setTimeout(() => {
      setLeavingImage(null);
      setIsTransitioning(false);
    }, transitionDuration + 200);
  };

  return (
    <div className="slideshow-wrapper">
      <div className="slideshow-container" ref={slideshowRef}>
        {/* 離場圖片 */}
        {leavingImage && (
          <img
            src={`${IMAGE_BASE_URL}/${leavingImage}`}
            alt=""
            className="slideshow-image slide-out"
            key={`${leavingImage}_leaving`}
          />
        )}
        
        {/* 活動圖片 */}
        {activeImage ? (
          <img
            src={`${IMAGE_BASE_URL}/${activeImage}`}
            alt=""
            className={`slideshow-image ${currentAnimation} ${showActive ? 'active' : ''}`}
            key={`${activeImage}_${currentAnimation}`}
          />
        ) : (
          <p className="loading-text">正在載入圖片...</p>
        )}
      </div>

      {/* 控制按鈕 */}
      <div className="controls">
        <button className="btn" onClick={handlePrev} disabled={isTransitioning}>
          上一張
        </button>
        <button className="btn" onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? '▶️ 播放' : '⏸️ 暫停'}
        </button>
        <button className="btn" onClick={handleNext} disabled={isTransitioning}>
          下一張
        </button>
        <button className="btn" onClick={toggleFullscreen}>
          {isFullscreen ? '🗗 退出全螢幕' : '🗖 全螢幕'}
        </button>
      </div>

      {/* 動畫效果指示 */}
      <div style={{ marginTop: '10px', color: '#666', fontSize: '12px', textAlign: 'center' }}>
        當前動畫: {currentAnimation} {isTransitioning ? '(切換中...)' : ''}
      </div>

      {/* 圖片指示器 */}
      {images.length > 1 && (
        <div className="indicators">
          {images.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlideIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
            />
          ))}
        </div>
      )}

      {/* 圖片計數 */}
      {images.length > 0 && (
        <div className="image-counter">
          {currentSlideIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

export default Slideshow;