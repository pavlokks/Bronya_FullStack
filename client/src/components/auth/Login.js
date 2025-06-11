import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import swal from 'sweetalert';
import { url } from '../../utils/Constants';
import { UserContext } from '../../context/UserContext.jsx';

const Login = () => {
  const { setIslogin } = useContext(UserContext);

  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  // Обробка змін у полях форми
  const onChange = (event) => {
    setCredentials({
      ...credentials,
      [event.target.name]: event.target.value,
    });
  };

  // Відправка форми входу
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (validateForm()) {
      try {
        const response = await fetch(`${url}/auth/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
          mode: 'cors',
          referrerPolicy: 'origin-when-cross-origin',
        });
        const jsonData = await response.json();

        if (jsonData.success === true) {
          swal({
            title: 'Вітаємо!',
            text: 'Вхід виконано успішно',
            icon: 'success',
            button: 'Ок',
          });
          await localStorage.setItem('token', jsonData.authToken);
          await localStorage.setItem('userInfo', JSON.stringify(jsonData));
          setIslogin(true);
          navigate('/');
        } else {
          swal({
            title: 'Спробуйте ще раз!',
            text: jsonData.message || 'Невірні дані',
            icon: 'error',
            button: 'Ок',
          });
        }
      } catch (err) {
        swal({
          title: 'Спробуйте ще раз!',
          text: 'Помилка сервера',
          icon: 'error',
          button: 'Ок',
        });
      }
    }
  };

  // Перемикання видимості пароля
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleShowPassword = () => {
    return showPassword ? 'text' : 'password';
  };

  // Валідація форми
  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!credentials.email) {
      errors.email = 'Електронна пошта обов’язкова';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = 'Невірний формат електронної пошти';
      isValid = false;
    }

    if (!credentials.password) {
      errors.password = 'Пароль обов’язковий';
      isValid = false;
    } else if (credentials.password.length < 8) {
      errors.password = 'Пароль має містити принаймні 8 символів';
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  return (
    <div className="container-fluid d-flex px-0 section">
      <section className="left-panel"></section>
      <section className="right-panel">
        <div className="main-heading">Вітаємо</div>
        <div className="regular-text">Введіть ваші дані для входу</div>
        <div className="sep" />
        <div className="page-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="exampleInputEmail1">
                Електронна пошта<span className="required">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                placeholder="Введіть електронну пошту"
                value={credentials.email}
                onChange={onChange}
                name="email"
              />
              {errors.email && (
                <span style={{ color: 'red', fontSize: 'small' }}>{errors.email}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="exampleInputPassword1">
                Пароль<span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={handleShowPassword()}
                  className="form-control"
                  id="exampleInputPassword1"
                  placeholder="Пароль"
                  value={credentials.password}
                  onChange={onChange}
                  name="password"
                />
                <i
                  className="password-icon"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '0.75rem',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                  }}
                  onClick={togglePassword}
                >
                  {showPassword ? (
                    <i className="fa-solid fa-eye-slash" />
                  ) : (
                    <i className="fa-solid fa-eye" />
                  )}
                </i>
              </div>
              {errors.password && (
                <span style={{ color: 'red', fontSize: 'small' }}>{errors.password}</span>
              )}
            </div>
            <div className="form-settings d-flex justify-content-between">
              <div>
                <br />
                <Link to="/forgotpassword">Забули пароль?</Link>
              </div>
            </div>
            <div className="pt-3" />
            <div className="form-button">
              <br />
              <button type="submit" className="btn btn-primary">
                Увійти
              </button>
            </div>
          </form>
          <div className="regular-text text-center">
            Немає облікового запису? <Link to="/signup">Зареєструватися</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
