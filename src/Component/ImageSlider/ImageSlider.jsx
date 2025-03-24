import React, { useRef, useState, useCallback, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "./ImageSlider.css";
import { Pagination } from "swiper/modules";

// Utility function to optimize base64 images
const optimizeBase64Image = (base64String, quality = 0.7, maxWidth = 1200) => {
  return new Promise((resolve, reject) => {
    // Create an image element
    const img = new Image();
    
    img.onload = () => {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const optimizedBase64 = canvas.toDataURL('image/jpeg', quality);
      const optimizedString = optimizedBase64.replace('data:image/jpeg;base64,', '');
      resolve(optimizedString);
    };
    
    img.onerror = () => {
      reject(new Error('Image loading failed'));
    };
    
    img.src = `data:image/jpeg;base64,${base64String}`;
  });
};

const ImageSlider = ({ images }) => {
  const swiperRef = useRef(null);
  const [optimizedImages, setOptimizedImages] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    setIsOptimizing(true);
    
    const optimizeImages = async () => {
      try {
        if (isMounted) {
          setOptimizedImages(images);
        }
        
        const optimizationPromises = images.map(img => 
          optimizeBase64Image(img, 0.7, 1200)
        );
        
        const optimizedResults = await Promise.all(optimizationPromises);
        
        if (isMounted) {
          setOptimizedImages(optimizedResults);
          setIsOptimizing(false);
        }
      } catch (error) {
        console.error("Image optimization failed:", error);
        if (isMounted) {
          setIsOptimizing(false);
        }
      }
    };
    
    optimizeImages();
    
    return () => {
      isMounted = false;
    };
  }, [images]);
  
  const handlePrev = useCallback((e) => {
    e.stopPropagation();
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  }, []);
  
  const handleNext = useCallback((e) => {
    e.stopPropagation();
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  }, []);
  
  // Generate image URLs only when optimizedImages changes
  const imageUrls = optimizedImages.map(img => `data:image/jpeg;base64,${img}`);
  
  return (
    <div className="tour-slider">
      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        pagination={{
          dynamicBullets: true,
          clickable: true,
        }}
        modules={[Pagination]}
        className="mySwiper"
        spaceBetween={10}
        lazy={true}
      >
        {imageUrls.map((imageUrl, index) => (
          <SwiperSlide key={index}>
            {isOptimizing && index === 0 ? (
              <div className="loading-indicator">Optimizing images...</div>
            ) : (
              <img
                src={imageUrl}
                alt={`Slide ${index + 1}`}
                className="tour-property-image"
                loading="lazy"
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
      
      <button 
        className="custom-prev-btn" 
        onClick={handlePrev}
        disabled={isOptimizing}
      >
        &#8249;
      </button>
      <button 
        className="custom-next-btn" 
        onClick={handleNext}
        disabled={isOptimizing}
      >
        &#8250;
      </button>
    </div>
  );
};

export default ImageSlider;
