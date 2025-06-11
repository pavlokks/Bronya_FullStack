import { useContext, useEffect } from 'react';
import { UserContext } from '../../context/UserContext.jsx';
import swal from 'sweetalert';
import { useParams, useNavigate } from 'react-router-dom';
import PlacesPage from './myhosting/PlacesPage';
import AccountNav from './AccountNav';
import '../../assets/styles/profile.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { islogin, setIslogin, username } = useContext(UserContext);
  const { subpage = 'profile' } = useParams();

  const logout = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setIslogin(false);
    swal({
      title: 'Ви успішно вийшли!',
      text: 'Увійдіть знову!',
      icon: 'success',
      button: 'Ок',
    });
    navigate('/login');
  };

  useEffect(() => {
    if (!islogin) {
      swal({
        title: 'Увійдіть!',
        text: 'Перейдіть на сторінку авторизації!',
        icon: 'error',
        button: 'Ок',
      });
      navigate('/login');
    }
  }, [islogin, navigate]);

  return (
    <div className="section">
      <AccountNav />
      {subpage === 'profile' && (
        <div className="text-center max-w-lg mx-auto">
          <p className="text-xl mb-4">
            Ви увійшли як <span className="font-semibold">{username}</span>
          </p>
          <button onClick={logout} className="btn btn-primary max-w-sm" aria-label="Вийти">
            Вийти
          </button>
        </div>
      )}
      {subpage === 'places' && <PlacesPage />}
    </div>
  );
}
