import '../assets/styles/footer.css';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" style={{ fontFamily: 'Victor Mono, monospace' }}>
      <div className="footer-body">
        <div className="footer-content">
          <p>© {year} Львівський національний університет імені Івана Франка</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
