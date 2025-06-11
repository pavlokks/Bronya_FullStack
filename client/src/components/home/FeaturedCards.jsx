import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/styles/featuredcards.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import 'swiper/css';

const FeaturedCards = ({ images, type }) => {
  const [windowSize, setWindowSize] = useState(window.innerWidth);

  const typeTranslations = {
    Flat: 'квартири',
    Hotel: 'готелі',
    Room: 'кімнати',
  };

  useEffect(() => {
    const handleResize = () => setWindowSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="featured-cards">
      <div className="featured-cards-container container">
        <div className="featured-cards-content">
          <h2>Найкращі {typeTranslations[type] || type} для вас</h2>
          <p>Унікальні пропозиції, створені з думкою про вас!</p>
        </div>
        <Swiper
          spaceBetween={16}
          modules={[Autoplay, Pagination]}
          slidesPerView={windowSize <= 768 ? 1 : windowSize <= 1024 ? 2 : 3}
          autoplay={{ delay: 2000, disableOnInteraction: true }}
          loop={false}
          speed={1000}
          pagination={{ clickable: true }}
          direction="horizontal"
          reverseDirection={false}
        >
          {images.map((data) => (
            <SwiperSlide key={data._id}>
              <Link to={`/detail/${data._id}`}>
                <div className="feature-card">
                  <div className="feature-card-img">
                    <img src={data.photos[0]} alt={data.title} />
                  </div>
                  <div className="feature-card-content">
                    <h4>{data.title}</h4>
                    <h5>{data.address}</h5>
                    <div className="price">
                      ₴{type === 'Hotel' ? data.price : data.price * 30}
                      <span>{type === 'Hotel' ? ' за ніч' : ' на місяць'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default FeaturedCards;
