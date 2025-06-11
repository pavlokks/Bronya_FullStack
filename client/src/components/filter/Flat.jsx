import '../../assets/styles/filter.css';
import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { url } from '../../utils/Constants';
import list from '../../assets/data/cities.json';
import { UserContext } from '../../context/UserContext.jsx';
import swal from 'sweetalert';
import CircularProgress from '@mui/material/CircularProgress';
import { Search, X, ArrowLeft, ArrowRight, Heart } from 'lucide-react';

function Flat() {
  const [sort, setSort] = useState('new');
  const [flats, setFlats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const authToken = localStorage.getItem('token');
  const { islogin, filterData, setFilterData } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const initialAddress = query.get('address') || filterData.address || '';

  const [filter, setFilter] = useState({
    address: initialAddress,
    placetype: 'Flat',
  });

  const [filterDatas, setFilterDatas] = useState({
    address: initialAddress,
    placetype: 'Flat',
  });

  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE_OPTIONS = [5, 10, 20];

  const onChange = (event) => {
    setFilter({ ...filter, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFilterData(filter);
    setFilterDatas(filter);
    navigate(`/flat?address=${encodeURIComponent(filter.address)}`);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setFilter({ address: '', placetype: 'Flat' });
    setFilterData({ address: '', placetype: 'Flat' });
    setFilterDatas({ address: '', placetype: 'Flat' });
    setCurrentPage(1);
    navigate('/flat');
  };

  const handlePreviousPage = async () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = async () => {
    if (currentPage < pageCount) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageSizeChange = async (event) => {
    const newSize = parseInt(event.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const getData = async () => {
    setIsLoading(true);
    try {
      const req = `${url}/places?page=${currentPage}&size=${pageSize}&address=${encodeURIComponent(
        filterDatas.address,
      )}&sort=${sort}&placetype=flat`;
      const response = await fetch(req, {
        method: 'GET',
        mode: 'cors',
        referrerPolicy: 'origin-when-cross-origin',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

      const responseData = await response.json();
      if (response.status === 200) {
        setFlats(responseData.placesdata);
        setPageCount(responseData.Pagination.pageCount);
        setTotalCount(responseData.Pagination.count);
      }
    } catch (err) {
      swal({
        title: 'Спробуйте ще раз!',
        text: 'Сервер недоступний!',
        icon: 'error',
        button: 'ОК',
      });
    }
    setIsLoading(false);
  };

  const perksTranslations = {
    wifi: 'Wi-Fi',
    parking: 'Парковка',
    tv: 'Телевізор',
    radio: 'Радіо',
    pets: 'Домашні тварини',
    entrance: 'Приватний вхід',
  };

  useEffect(() => {
    getData();
  }, [currentPage, pageSize, filterDatas, sort]);

  useEffect(() => {
    const address = query.get('address') || '';
    if (address && address !== filterDatas.address) {
      setFilter({ address, placetype: 'Flat' });
      setFilterDatas({ address, placetype: 'Flat' });
      setFilterData({ address, placetype: 'Flat' });
    }
  }, [location.search]);

  const addtosaved = async (id) => {
    if (!islogin) {
      swal({
        title: 'Потрібен вхід!',
        text: 'Перейдіть на сторінку входу!',
        icon: 'error',
        button: 'ОК',
      });
      navigate('/login');
    } else {
      try {
        const checkResponse = await fetch(`${url}/booking/addsaved/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            token: authToken,
          },
        });
        const data1 = await checkResponse.json();
        if (data1.success) {
          swal({
            title: 'Готово!',
            text: 'Квартиру додано до списку бажань!',
            icon: 'success',
            button: 'ОК',
          });
          navigate('/profile/saved');
        } else {
          swal({
            title: 'Вже додано!',
            text: 'Квартира вже є у списку бажань!',
            icon: 'error',
            button: 'ОК',
          });
        }
      } catch (err) {
        swal({
          title: 'Спробуйте ще раз!',
          text: 'Сервер недоступний!',
          icon: 'error',
          button: 'ОК',
        });
      }
    }
  };

  return (
    <div className="filter-section container">
      <div className="filter-header">
        <h2>Пошук квартир</h2>
        <form onSubmit={handleSubmit} className="filter-form">
          <div className="search-bar">
            <Search size={20} />
            <input
              list="data"
              name="address"
              value={filter.address}
              onChange={onChange}
              type="text"
              placeholder="Пошук за містом"
            />
            <datalist id="data">
              {list.map((op, i) => (
                <option key={i}>
                  {op.name}, {op.state}
                </option>
              ))}
            </datalist>
          </div>
          <div className="filter-controls">
            <select onChange={(e) => setSort(e.target.value)} value={sort} aria-label="Сортування">
              <option value="new">Нові спочатку</option>
              <option value="old">Старі спочатку</option>
              <option value="incprice">Ціна за зростанням</option>
              <option value="decprice">Ціна за спаданням</option>
            </select>
            <button type="submit" className="btn btn-primary">
              Пошук
            </button>
            <button onClick={handleReset} className="btn btn-secondary">
              <X size={20} /> Скинути
            </button>
          </div>
        </form>
        <p>
          Усього доступно <strong>{totalCount}</strong> квартир
        </p>
      </div>
      {isLoading ? (
        <div className="loading">
          <CircularProgress />
        </div>
      ) : !flats ? (
        <div className="error-message">
          <h1>Помилка!</h1>
          <p>Не вдалося завантажити дані.</p>
        </div>
      ) : flats.length === 0 ? (
        <div className="no-data">
          <h1>Дані не знайдено</h1>
          <p>Наразі немає доступних квартир.</p>
          <button onClick={handleReset} className="btn btn-primary">
            Видалити всі фільтри
          </button>
        </div>
      ) : (
        <div className="filter-results">
          {flats.map((flat) => (
            <div
              className={`filter-card ${
                !flat.photos || flat.photos.length === 0 ? 'no-image' : ''
              }`}
              key={flat._id}
            >
              {flat.photos && flat.photos.length > 0 && (
                <div className="card-image">
                  <img src={flat.photos[0]} alt="Квартира" />
                </div>
              )}
              <div className="card-content">
                <h3>{flat.title}</h3>
                <p className="perks">
                  {flat.perks &&
                    flat.perks.map((perk) => perksTranslations[perk] || perk).join(' • ')}
                </p>
                <p className="owner">
                  Власник: {flat.ownername} {flat.ownerlast}
                </p>
                <p className="date">
                  Опубліковано: {flat.datecreated ? flat.datecreated.split('T')[0] : '-'}
                </p>
                <p className="description">{flat.description}</p>
              </div>
              <div className="card-actions">
                <div className="price">
                  ₴{flat.price * 30} <span>на місяць</span>
                </div>
                <p className="address">{flat.address}</p>
                <div className="buttons">
                  {flat.isbooked ? (
                    <button disabled className="btn btn-disabled">
                      Уже заброньовано
                    </button>
                  ) : (
                    <Link to={`/detail/${flat._id}`}>
                      <button className="btn btn-primary">Деталі</button>
                    </Link>
                  )}
                  <button className="btn btn-secondary" onClick={() => addtosaved(flat._id)}>
                    <Heart size={20} /> Додати до бажань
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="pagination">
            <div className="page-size">
              <label htmlFor="pageSizeSelect">Елементів на сторінці: </label>
              <select id="pageSizeSelect" value={pageSize} onChange={handlePageSizeChange}>
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="page-controls">
              <button
                disabled={currentPage === 1}
                onClick={handlePreviousPage}
                className="btn btn-secondary"
              >
                <ArrowLeft size={20} /> Попередня
              </button>
              <button
                disabled={currentPage === pageCount}
                onClick={handleNextPage}
                className="btn btn-secondary"
              >
                Наступна <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Flat;
