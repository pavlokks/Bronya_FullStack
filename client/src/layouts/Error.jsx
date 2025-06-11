import { useNavigate } from 'react-router-dom';

function Error() {
  const navigate = useNavigate();
  const gotohome = () => {
    navigate('/');
  };
  return (
    <div className="section">
      <div
        style={{
          margin: '0 auto',
          background: '#fff',
          textAlign: 'center',
          padding: '5% 0% 0% 0%',
          width: '50%',
          height: '400px',
        }}
      >
        <h1
          style={{
            color: '#101828',
            fontSize: 30,
            fontWeight: 600,
            padding: '25px 0 0 0',
            fontFamily: 'Victor Mono',
          }}
        >
          Сторінку не знайдено
        </h1>
        <div
          style={{
            color: '(2, 161, 13)',
            fontSize: 18,
            padding: '25px 0',
            fontFamily: 'Victor Mono',
          }}
        >
          Сторінка, яку ви шукаєте, не існує.
        </div>
        <button
          onClick={gotohome}
          style={{
            margin: '25px 0',
            background: '#2e7d32',
            border: '1px solidrgb(2, 161, 13)',
            color: '(2, 161, 13)',
            fontSize: 15,
            fontFamily: 'Victor Mono',
            width: 280,
            height: 40,
            boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
            borderRadius: 8,
          }}
        >
          Повернутися на головну
        </button>
      </div>
    </div>
  );
}

export default Error;
