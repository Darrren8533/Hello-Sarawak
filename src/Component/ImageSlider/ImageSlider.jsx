import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "./ImageSlider.css";
import { Pagination } from "swiper/modules";

const ImageSlider = ({ images }) => {
  const swiperRef = useRef(null);

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
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <img
              src={`data:image/jpeg;base64,${image}`}
              alt={`Slide ${index + 1}`}
              className="tour-property-image"
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
