import React, { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "./ImageSlider.css";
import { Pagination } from "swiper/modules";

// Utility function to optimize base64 images
const optimizeBase64Image = (base64String, quality = 0.7, maxWidth = 1200) => {
  return new Promise((resolve) => {
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
    
    // Set source of image
    img.src = `data:image/jpeg;base64,${base64String}`;
  });
};

const ImageSlider = ({ images }) => {
  const swiperRef = useRef(null);
  const [optimizedImages, setOptimizedImages] = useState([]);
  const [isOptimizing, setIsOptimizing] = useState(true);
  
  useEffect(() => {
    const optimizeImages = async () => {
      setIsOptimizing(true);
      
      const optimized = [];
      for (const base64Image of images) {
        optimized.push(base64Image);
        setOptimizedImages([...optimized]);
        
        const optimizedImage = await optimizeBase64Image(base64Image, 0.7, 1200);
        
        optimized[optimized.length - 1] = optimizedImage;
        setOptimizedImages([...optimized]);
      }
      
      setIsOptimizing(false);
    };
    
    optimizeImages();
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
  
  // Image cache for decoded images
  const imageCache = useMemo(() => {
    return optimizedImages.map(img => `data:image/jpeg;base64,${img}`);
  }, [optimizedImages]);
  
  return (
    <div className="tour-slider">
      {isOptimizing && (
        <div className="optimization-indicator">Optimizing images...</div>
      )}
      
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
        {optimizedImages.map((image, index) => (
          <SwiperSlide key={index}>
            <img
              src={imageCache[index]}
              alt={`Slide ${index + 1}`}
              className="tour-property-image"
              loading="lazy"
            />
          </SwiperSlide>
        ))}
      </Swiper>
      
      <button className="custom-prev-btn" onClick={handlePrev}>
        &#8249;
      </button>
      <button className="custom-next-btn" onClick={handleNext}>
        &#8250;
      </button>
    </div>
  );
};

export default ImageSlider;
