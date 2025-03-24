import React, { useRef, useState, useCallback, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "./ImageSlider.css";
import { Pagination } from "swiper/modules";

// Create a simple hash for caching
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

const ImageSlider = ({ images }) => {
  const swiperRef = useRef(null);
  const [processedImages, setProcessedImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Process images with a more efficient approach
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    // Generate very small thumbnails for immediate display
    const generateThumbnails = async () => {
      if (!images.length) return [];
      
      const thumbnails = images.map(base64 => {
        // Check if we have a cached version
        const imageHash = hashString(base64.substring(0, 100));
        const cachedThumb = localStorage.getItem(`thumb_${imageHash}`);
        
        if (cachedThumb) return cachedThumb;
        
        // Create tiny placeholders for all images
        return base64;
      });
      
      if (isMounted) {
        setProcessedImages(thumbnails.map(thumb => ({ 
          thumbnail: thumb,
          full: null,
          isOptimizing: true
        })));
      }
    };
    
    generateThumbnails();

    const processVisibleImages = async () => {
      const processImage = async (index) => {
        if (index < 0 || index >= images.length) return;
        
        const imageHash = hashString(images[index].substring(0, 100));
        const cachedFull = localStorage.getItem(`full_${imageHash}`);
        
        if (cachedFull) {
          if (isMounted) {
            setProcessedImages(prev => {
              const newImages = [...prev];
              newImages[index] = { 
                ...newImages[index], 
                full: cachedFull,
                isOptimizing: false
              };
              return newImages;
            });
          }
          return;
        }
        
        const optimizeInMainThread = async (base64) => {
          const img = new Image();
          await new Promise(resolve => {
            img.onload = resolve;
            img.src = `data:image/jpeg;base64,${base64}`;
          });
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          let width = img.width;
          let height = img.height;
          const maxWidth = 1200;
          
          if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = maxWidth;
            height = Math.floor(height * ratio);
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          const optimized = canvas.toDataURL('image/jpeg', 0.7)
            .replace('data:image/jpeg;base64,', '');
          
          localStorage.setItem(`full_${imageHash}`, optimized);
          
          return optimized;
        };
        
        try {
          const optimized = await optimizeInMainThread(images[index]);
          
          if (isMounted) {
            setProcessedImages(prev => {
              const newImages = [...prev];
              newImages[index] = { 
                ...newImages[index], 
                full: optimized,
                isOptimizing: false
              };
              return newImages;
            });
          }
        } catch (error) {
          console.error("Failed to optimize image:", error);
        }
      };
      
      await processImage(currentIndex);
      
      let distance = 1;
      while (distance < 3) {
        await Promise.all([
          processImage(currentIndex + distance),
          processImage(currentIndex - distance)
        ]);
        distance++;
      }
      
      if (isMounted) {
        setIsLoading(false);
      }
    };
    
    processVisibleImages();
    
    return () => {
      isMounted = false;
    };
  }, [images, currentIndex]);
  
  const handleSlideChange = (swiper) => {
    setCurrentIndex(swiper.activeIndex);
  };
  
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
  
  return (
    <div className="tour-slider">
      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={handleSlideChange}
        pagination={{
          dynamicBullets: true,
          clickable: true,
        }}
        modules={[Pagination]}
        className="mySwiper"
        spaceBetween={10}
        lazy={true}
      >
        {processedImages.map((image, index) => {
          // Determine what image to show
          const imageSource = image.full 
            ? `data:image/jpeg;base64,${image.full}`
            : `data:image/jpeg;base64,${image.thumbnail}`;
            
          return (
            <SwiperSlide key={index}>
              <div className="image-container">
                <img
                  src={imageSource}
                  alt={`Slide ${index + 1}`}
                  className={`tour-property-image ${image.isOptimizing ? 'loading' : ''}`}
                  loading="lazy"
                />
                {image.isOptimizing && (
                  <div className="optimization-indicator"></div>
                )}
              </div>
            </SwiperSlide>
          );
        })}
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
