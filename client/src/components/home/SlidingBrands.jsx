import { useState, useEffect } from 'react';
import '../../assets/styles/slidingbrands.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css/autoplay';
import 'swiper/css';

const SlidingBrands = ({ small, title }) => {
  const brands = [
    require('../../assets/media/images/cityicon/Дніпро.png'),
    require('../../assets/media/images/cityicon/Запоріжжя.png'),
    require('../../assets/media/images/cityicon/Київ.png'),
    require('../../assets/media/images/cityicon/Кривий Ріг.png'),
    require('../../assets/media/images/cityicon/Львів.png'),
    require('../../assets/media/images/cityicon/Миколаїв.png'),
    require('../../assets/media/images/cityicon/Одеса.png'),
    require('../../assets/media/images/cityicon/Полтава.png'),
    require('../../assets/media/images/cityicon/Рівне.png'),
    require('../../assets/media/images/cityicon/Черкаси.png'),
  ];

  const [windowSize, setWindowSize] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="sliding-brands">
      <div className="sliding-brands-container container">
        <h2>
          {small}
          <span>{title}</span>
        </h2>
        <div className="brands-container">
          <Swiper
            spaceBetween={8}
            slidesPerView={windowSize <= 768 ? 3 : windowSize <= 1024 ? 4 : 6}
            modules={[Autoplay]}
            autoplay={{
              delay: 1000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
              reverseDirection: false,
            }}
            loop={brands.length > 1}
            speed={2000}
          >
            {brands.map((ele, i) => (
              <SwiperSlide key={i}>
                <img src={ele} alt={`Місто ${i + 1}`} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default SlidingBrands;
