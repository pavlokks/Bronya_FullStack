import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import swal from 'sweetalert';
import { url } from '../../utils/Constants';

const ForgotPass = (props) => {
  const [credentials, setCredentials] = useState({
    email: props.email || '',
    password: '',
    authcode: '',
  });

  const navigate = useNavigate();
  const [sendOtp, setSendOtp] = useState(false);
  const [errors, setErrors] = useState({});

  const onChange = (event) => {
    if (event.target.name === 'authcode') {
      const authcodeValue = event.target.value.substring(0, 6);
      setCredentials({ ...credentials, [event.target.name]: authcodeValue });
    } else {
      setCredentials({
        ...credentials,
        [event.target.name]: event.target.value,
      });
    }
  };

  const sendMail = async (event) => {
    event.preventDefault();
    if (validateMail()) {
      try {
        const response = await fetch(`${url}/fogotpassword/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: credentials.email }),
        });
        const json = await response.json();

        if (json.success === true) {
          swal({
            title: 'Гарна робота!',
            text: 'Лист успішно надіслано!',
            icon: 'success',
            button: 'ОК!',
          });
          setSendOtp(true);
        } else {
          swal({
            title: 'Спробуйте ще раз!',
            text: json.message || 'Помилка',
            icon: 'error',
            button: 'ОК!',
          });
          setSendOtp(false);
        }
      } catch (err) {
        swal({
          title: 'Спробуйте ще раз!',
          text: 'Сервер не працює!',
          icon: 'error',
          button: 'ОК!',
        });
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch(`${url}/fogotpassword/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
            authcode: credentials.authcode, // Send as string
          }),
        });
        const json = await response.json();

        if (json.success === true) {
          swal({
            title: 'Успіх!',
            text: 'Пароль успішно змінено',
            icon: 'success',
            button: 'ОК!',
          });
          navigate('/login');
        } else {
          swal({
            title: 'Спробуйте ще раз!',
            text: json.message || 'Недійсний OTP!',
            icon: 'error',
            button: 'ОК!',
          });
        }
      } catch (err) {
        swal({
          title: 'Спробуйте ще раз!',
          text: 'Сервер не працює!',
          icon: 'error',
          button: 'ОК!',
        });
      }
    }
  };

  const validateMail = () => {
    let errors = {};
    let isValid = true;

    if (!credentials.email) {
      errors.email = "Електронна пошта обов'язкова";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = 'Недійсний формат електронної пошти';
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!credentials.authcode) {
      errors.authcode = "Код підтвердження обов'язковий";
      isValid = false;
    } else if (credentials.authcode.length !== 6) {
      errors.authcode = 'Код підтвердження має містити 6 символів';
      isValid = false;
    }

    if (!credentials.password) {
      errors.password = "Пароль обов'язковий";
      isValid = false;
    } else if (credentials.password.length < 8) {
      errors.password = 'Пароль має містити щонайменше 8 символів';
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleShowPassword = () => {
    return showPassword ? 'text' : 'password';
  };

  return (
    <div className="container-fluid d-flex px-0 section">
      <section className="left-panel"></section>
      <section className="right-panel">
        <div className="main-heading">Забули пароль?</div>
        <div className="regular-text">
          {sendOtp === false
            ? "Введіть електронну пошту, пов'язану з вашим обліковим записом, і ми надішлемо лист із інструкціями для скидання пароля."
            : 'Лист із кодом підтвердження надіслано на вашу електронну пошту. Встановіть новий пароль за допомогою OTP-підтвердження'}
        </div>
        <div className="sep" />
        <div className="page-form">
          {sendOtp === false ? (
            <form onSubmit={sendMail}>
              <div className="form-group">
                <label htmlFor="exampleInputEmail1">
                  Будь ласка, вкажіть вашу електронну адресу
                  <span className="required">*</span>
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
              <br />
              <div className="form-settings d-flex justify-content-end">
                <div className="text-end">
                  <span className="regular-text">Пам'ятаєте свій пароль?</span>
                  <br />
                  <Link to="/login">Повернутися до входу</Link>
                </div>
              </div>
              <div className="pt-3" />
              <br />
              <div className="form-button">
                <button type="submit" className="btn btn-primary">
                  Скинути пароль
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="exampleInputauthcode1">
                  Код підтвердження<span className="required">*</span>
                </label>
                <input
                  type="text" // Changed to text
                  className="form-control"
                  id="exampleInputauthcode1"
                  aria-describedby="authcodeHelp"
                  placeholder="Введіть код підтвердження"
                  value={credentials.authcode}
                  onChange={onChange}
                  name="authcode"
                />
                {errors.authcode && (
                  <span style={{ color: 'red', fontSize: 'small' }}>{errors.authcode}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="exampleInputPassword1">
                  Встановіть новий пароль<span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={handleShowPassword()}
                    className="form-control"
                    id="exampleInputPassword"
                    required
                    minLength={8}
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

              <div className="pt-3" />
              <div className="form-button">
                <button type="submit" className="btn btn-primary">
                  Скинути пароль
                </button>
              </div>
              <div className="pt-3" />
            </form>
          )}

          <div className="regular-text text-center">
            Немає облікового запису? <Link to="/signup">Зареєструватися</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPass;
