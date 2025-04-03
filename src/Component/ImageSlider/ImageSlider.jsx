import React, { useRef, useMemo, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "./ImageSlider.css";
import { Pagination } from "swiper/modules";

const ImageSlider = ({ images }) => {
  const swiperRef = useRef(null);
  const [isSwiperReady, setIsSwiperReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSwiperReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handlePrev = (e) => {
    e.stopPropagation();
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  const optimizedImages = useMemo(() => images, [images]);

  return (
    <div className="tour-slider">
      {isSwiperReady && (
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
                src={`data:image/jpeg;base64,${image}`}
                alt={`Slide ${index + 1}`}
                className="tour-property-image"
                loading="lazy"
                srcSet={`data:image/webp;base64,${image} 300w, 
                         data:image/webp;base64,${image} 600w, 
                         data:image/webp;base64,${image} 1200w`}
                sizes="(max-width: 600px) 300px, (max-width: 1024px) 600px, 1200px"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
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