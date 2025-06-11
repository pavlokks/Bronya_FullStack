import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import swal from 'sweetalert';
import { url } from '../../utils/Constants';
import { UserContext } from '../../context/UserContext.jsx';

const Signup = (props) => {
  const { setIslogin } = useContext(UserContext);

  const [credentials, setCredentials] = useState({
    fname: '',
    lname: '',
    email: props.email || '',
    password: '',
    phone: '',
    authcode: null,
  });

  const navigate = useNavigate();
  const [sendOtp, setSendOtp] = useState(false);
  const [errors, setErrors] = useState({});

  // Перемикання видимості пароля
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleShowPassword = () => {
    return showPassword ? 'text' : 'password';
  };

  // Обробка змін у полях форми
  const onChange = (event) => {
    if (event.target.name === 'phone') {
      const phoneValue = event.target.value.substring(0, 10);
      setCredentials({ ...credentials, [event.target.name]: phoneValue });
    } else if (event.target.name === 'authcode') {
      const authcodeValue = event.target.value.substring(0, 6);
      setCredentials({ ...credentials, [event.target.name]: authcodeValue });
    } else {
      setCredentials({
        ...credentials,
        [event.target.name]: event.target.value,
      });
    }
  };

  // Відправка форми реєстрації
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateMail()) {
      try {
        const response = await fetch(`${url}/auth/signup/email/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({
            fname: credentials.fname,
            lname: credentials.lname,
            phone: credentials.phone,
            email: credentials.email,
            password: credentials.password,
            authcode: Number(credentials.authcode),
          }),
          mode: 'cors',
          referrerPolicy: 'origin-when-cross-origin',
        });
        const json = await response.json();

        if (json.success === true) {
          swal({
            title: 'Успіх!',
            text: 'Обліковий запис успішно створено',
            icon: 'success',
            button: 'Ок!',
          });
          await localStorage.setItem('token', json.authToken);
          await localStorage.setItem('userInfo', JSON.stringify(json));
          setIslogin(true);
          navigate('/');
        } else {
          swal({
            title: 'Спробуйте ще раз!',
            text: json.message || 'Сталася помилка',
            icon: 'error',
            button: 'Ок!',
          });
        }
      } catch (err) {
        swal({
          title: 'Спробуйте ще раз!',
          text: 'Сервер не працює!',
          icon: 'error',
          button: 'Ок!',
        });
      }
    }
  };

  // Відправка коду підтвердження
  const sendMail = async (event) => {
    event.preventDefault();

    if (validateForm()) {
      try {
        const response = await fetch(`${url}/auth/signup/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ email: credentials.email }),
          mode: 'cors',
          referrerPolicy: 'origin-when-cross-origin',
        });
        const json = await response.json();

        if (json.success === true) {
          swal({
            title: 'Відмінно!',
            text: 'Електронний лист із кодом підтвердження надіслано!',
            icon: 'success',
            button: 'Ок!',
          });
          setSendOtp(true);
        } else {
          swal({
            title: 'Спробуйте ще раз!',
            text: json.message || 'Сталася помилка',
            icon: 'error',
            button: 'Ок!',
          });
          setSendOtp(false);
        }
      } catch (err) {
        swal({
          title: 'Спробуйте ще раз!',
          text: 'Сервер не працює!',
          icon: 'error',
          button: 'Ок!',
        });
      }
    }
  };

  // Валідація коду підтвердження
  const validateMail = () => {
    let errors = {};
    let isValid = true;

    if (!credentials.authcode) {
      errors.authcode = 'Код підтвердження обов’язковий';
      isValid = false;
    } else if (credentials.authcode?.length !== 6) {
      errors.authcode = 'Код підтвердження має містити 6 символів';
      isValid = false;
    }
    setErrors(errors);
    return isValid;
  };

  // Валідація форми
  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!credentials.fname) {
      errors.fname = 'Ім’я обов’язкове';
      isValid = false;
    } else if (credentials.fname?.length < 2) {
      errors.fname = 'Ім’я має містити принаймні 2 символи';
      isValid = false;
    }

    if (!credentials.lname) {
      errors.lname = 'Прізвище обов’язкове';
      isValid = false;
    } else if (credentials.lname?.length < 2) {
      errors.lname = 'Прізвище має містити принаймні 2 символи';
      isValid = false;
    }

    if (!credentials.email) {
      errors.email = 'Електронна пошта обов’язкова';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = 'Невірний формат електронної пошти';
      isValid = false;
    }

    if (!credentials.phone) {
      errors.phone = 'Номер телефону обов’язковий';
      isValid = false;
    } else if (!/^\d{10}$/.test(credentials.phone)) {
      errors.phone = 'Невірний формат номера телефону';
      isValid = false;
    }

    if (!credentials.password) {
      errors.password = 'Пароль обов’язковий';
      isValid = false;
    } else if (credentials.password?.length < 8) {
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
        <div className="main-heading">Реєстрація</div>
        <div className="regular-text">
          Дякуємо, що зареєструвались!
          <br />
          {sendOtp === false
            ? 'Будь ласка, заповніть форму нижче, щоб створити обліковий запис'
            : 'Лист із кодом підтвердження надіслано на вашу електронну адресу'}
        </div>
        <div className="sep" />
        <div className="page-form">
          {sendOtp === false ? (
            <form onSubmit={sendMail}>
              <div className="form-group">
                <div className="row">
                  <div className="col">
                    <label htmlFor="exampleInputEmail1">
                      Ім’я<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ім’я"
                      aria-label="Ім’я"
                      value={credentials.fname}
                      onChange={onChange}
                      name="fname"
                    />
                    {errors.fname && (
                      <span style={{ color: 'red', fontSize: 'small' }}>{errors.fname}</span>
                    )}
                  </div>
                  <div className="col">
                    <label htmlFor="exampleInputEmail1">
                      Прізвище<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Прізвище"
                      aria-label="Прізвище"
                      value={credentials.lname}
                      onChange={onChange}
                      name="lname"
                    />
                    {errors.lname && (
                      <span style={{ color: 'red', fontSize: 'small' }}>{errors.lname}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="exampleInputPhone">
                  Телефон<span className="required">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="exampleInputPhone"
                  aria-describedby="phoneHelp"
                  placeholder="Введіть номер телефону"
                  value={credentials.phone}
                  onChange={onChange}
                  name="phone"
                />
                {errors.phone && (
                  <span style={{ color: 'red', fontSize: 'small' }}>{errors.phone}</span>
                )}
              </div>
              <div className="form-group">
                <div className="row">
                  <div className="col">
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
                  <div className="col">
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
                </div>
                <div className="pt-3" />
                <div className="form-button">
                  <br />
                  <button type="submit" className="btn btn-primary">
                    Надіслати код підтвердження
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="exampleInputAuthcode1">
                  Код підтвердження<span className="required">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="exampleInputAuthcode1"
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
              <div className="pt-3" />
              <div className="form-button">
                <button type="submit" className="btn btn-primary">
                  Перевірити код
                </button>
              </div>
            </form>
          )}
        </div>
        <div className="regular-text text-center">
          Уже маєте обліковий запис? <Link to="/login">Увійти</Link>
        </div>
      </section>
    </div>
  );
};

export default Signup;
