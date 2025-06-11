export default function Image({ src, alt = 'Зображення', ...rest }) {
  const baseUrl =
    process.env.REACT_APP_UPLOAD_URL || 'http://localhost:5000/uploads/';
  const imageSrc = src && src.includes('https://') ? src : `${baseUrl}${src}`;

  return <img {...rest} src={imageSrc} alt="" />;
}
