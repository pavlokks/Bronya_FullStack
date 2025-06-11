import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../assets/styles/commoncards.css';
import { UserContext } from '../../context/UserContext.jsx';

const CommonCards = ({ images, type }) => {
  const { setFilterData } = useContext(UserContext);
  const navigate = useNavigate();

  const handleUpdatePlacetypeAddress = (link, address, placetype) => {
    setFilterData({ address, placetype });
    navigate(`${link}?address=${encodeURIComponent(address)}`);
  };

  return (
    <section className="common-cards card-cont">
      <div className="common-cards-container container">
        <div className="common-cards-images">
          {images.slice(0, 3).map((ele) => (
            <div className="common-cards-image" key={ele.image}>
              <button onClick={() => handleUpdatePlacetypeAddress(ele.link, ele.address, type)}>
                <img src={ele.image} alt={ele.title} />
                <span className="card-title">{ele.title}</span>
              </button>
            </div>
          ))}
          <Link to={`./${type.toLowerCase()}`} className="common-cards-explore">
            <span>Переглянути все</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CommonCards;
