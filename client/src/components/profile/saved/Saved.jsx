import '../../../assets/styles/profile.css';
import AccountNav from '../AccountNav';
import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { url } from '../../../utils/Constants';
import list from '../../../assets/data/cities.json';
import { UserContext } from '../../../context/UserContext.jsx';
import swal from 'sweetalert';
import CircularProgress from '@mui/material/CircularProgress';
import { Eye, Trash2, Search } from 'lucide-react';

function Saved() {
  const [isLoading, setIsLoading] = useState(true);
  const authToken = localStorage.getItem('token');
  const { islogin } = useContext(UserContext);
  const navigate = useNavigate();

  const [filter, setFilter] = useState({ address: '', placetype: '' });
  const [filterData, setFilterData] = useState({ address: '', placetype: '' });
  const [saved, setSaved] = useState([]);
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
    setCurrentPage(1);
    await getData();
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setFilter({ address: '', placetype: '' });
    setFilterData({ address: '', placetype: '' });
    setCurrentPage(1);
    await getData();
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < pageCount) setCurrentPage(currentPage + 1);
  };

  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const getData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${url}/booking/savedplaces?page=${currentPage}&size=${pageSize}&address=${filterData.address}&placetype=${filterData.placetype}`,
        { headers: { 'Content-Type': 'application/json', token: authToken } },
      );
      setSaved(response.data.saveddata);
      setPageCount(response.data.Pagination.pageCount);
      setTotalCount(response.data.Pagination.count);
    } catch (err) {
      swal({
        title: 'Помилка!',
        text: 'Сервер тимчасово недоступний.',
        icon: 'error',
        button: 'Ок',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeData = async (id) => {
    try {
      await axios.delete(`${url}/booking/removesaved/${id}`, {
        headers: { 'Content-Type': 'application/json', token: authToken },
      });
      swal({
        title: 'Успіх!',
        text: 'Місце видалено зі збережених.',
        icon: 'success',
        button: 'Ок',
      });
      getData();
    } catch (err) {
      swal({
        title: 'Помилка!',
        text: 'Не вдалося видалити місце.',
        icon: 'error',
        button: 'Ок',
      });
    }
  };

  useEffect(() => {
    if (!islogin) {
      swal({
        title: 'Потрібен вхід!',
        text: 'Перейдіть на сторінку входу!',
        icon: 'error',
        button: 'Ок',
      });
      navigate('/login');
    } else {
      getData();
    }
  }, [currentPage, pageSize, filterData, islogin, navigate]);

  const perkTranslations = {
    wifi: 'Wi-Fi',
    parking: 'Парковка',
    tv: 'Телевізор',
    radio: 'Радіо',
    pets: 'Домашні тварини',
    entrance: 'Приватний вхід',
  };

  const translatePerks = (perksArray) => {
    if (!perksArray || perksArray.length === 0) return 'Немає переваг';
    return perksArray.map((perk) => perkTranslations[perk] || perk).join(' • ');
  };

  const getPriceDetails = (placetype, price) => {
    if (placetype === 'Flat') {
      return { price: price * 30, unit: 'за місяць' };
    }
    return { price: price, unit: 'за ніч' };
  };

  return (
    <div className="section">
      <AccountNav />
      <div className="outer-border mx-4 my-4 p-6">
        <div className="filter-section">
          <div className="filter-header">
            <h2 className="text-2xl font-semibold">Пошук збереженого</h2>
            <form onSubmit={handleSubmit} className="filter-form">
              <div className="search-bar relative w-full">
                <Search className="lucide absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  list="data"
                  name="address"
                  value={filter.address}
                  onChange={onChange}
                  placeholder="Місто"
                  className="input-field pl-10"
                  aria-label="Пошук за містом"
                />
                <datalist id="data">
                  {list.map((op, i) => (
                    <option key={i}>
                      {op.name}, {op.state}
                    </option>
                  ))}
                </datalist>
              </div>
              <div className="form-group">
                <select
                  name="placetype"
                  value={filter.placetype}
                  onChange={onChange}
                  className="input-field"
                  aria-label="Тип місця"
                >
                  <option value="">Тип</option>
                  <option value="Hotel">Готелі</option>
                  <option value="Flat">Квартири</option>
                  <option value="Room">Кімнати</option>
                </select>
              </div>
              <div className="filter-controls">
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-outline-primary"
                  aria-label="Скинути фільтри"
                >
                  Скинути
                </button>
                <button type="submit" className="btn btn-primary" aria-label="Застосувати фільтри">
                  Застосувати
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="px-4 py-2">
          <b className="text-gray-700">Доступно {totalCount}:</b>
        </div>

        {isLoading ? (
          <div className="circle">
            <CircularProgress />
          </div>
        ) : !saved || saved.length === 0 ? (
          <div className="empty-state text-center">
            <h1 className="text-2xl font-semibold">Дані відсутні</h1>
            <p className="text-gray-500 mt-2">Наразі немає збережених місць для відображення.</p>
            <Link to="/" className="btn btn-primary mt-4" aria-label="Перейти на головну">
              Перейти на головну
            </Link>
          </div>
        ) : (
          saved.map((save) => {
            const { price: adjustedPrice, unit } = getPriceDetails(save.placetype, save.price);
            return (
              <div key={save._id} className="card my-4 p-4">
                <div className="row align-items-center">
                  <div className="col-md-12 col-lg-3 mb-4 mb-lg-0">
                    <div className="bg-image rounded-2xl h-48 overflow-hidden">
                      <img
                        src={
                          save.photos?.[0] ||
                          'https://cdn.sortiraparis.com/images/80/98390/1014564-avatar-le-dernier-maitre-de-l-air-la-serie-netflix-en-live-action-devoile-sa-bande-annonce-finale.jpg'
                        }
                        alt={save.title || 'Фото місця'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h5 className="text-xl font-semibold">{save.title}</h5>
                    <p className="text-muted mt-1">{translatePerks(save.perks)}</p>
                    <p className="text-muted mt-1">
                      Власник:{' '}
                      <span className="text-primary">
                        {save.ownername} {save.ownerlast}
                      </span>
                    </p>
                    <p className="text-truncate mt-1">{save.description}</p>
                  </div>
                  <div className="col-md-6 col-lg-3">
                    <div className="d-flex flex-column h-100 justify-content-between">
                      <div>
                        <h4 className="text-2xl font-semibold">
                          ₴{adjustedPrice} {unit}
                        </h4>
                        <p className="text-success mt-1">{save.address}</p>
                      </div>
                      <div className="mt-4 gap-2 d-flex flex-column">
                        {save.isbooked ? (
                          <button disabled className="btn btn-primary btn-sm w-full">
                            Наразі заброньовано!
                          </button>
                        ) : (
                          <Link
                            to={`/detail/${save._id}`}
                            className="btn btn-primary btn-sm w-full"
                            aria-label="Переглянути деталі"
                          >
                            <Eye className="lucide" /> Деталі
                          </Link>
                        )}
                        <button
                          onClick={() => removeData(save._id)}
                          className="btn btn-outline-primary btn-sm w-full"
                          aria-label="Видалити зі збережених"
                        >
                          <Trash2 className="lucide" /> Видалити
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div className="pagination">
          <div className="page-size">
            <label htmlFor="pageSizeSelect" className="text-gray-700">
              Вміст сторінки:
            </label>
            <select
              id="pageSizeSelect"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="input-field ml-2 w-auto"
            >
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
              className="btn btn-outline-primary"
              aria-label="Попередня сторінка"
            >
              Назад
            </button>
            <span className="text-gray-700 mx-2">
              Сторінка {currentPage} з {pageCount}
            </span>
            <button
              disabled={currentPage === pageCount}
              onClick={handleNextPage}
              className="btn btn-primary"
              aria-label="Наступна сторінка"
            >
              Наступна
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Saved;
