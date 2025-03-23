'use client';
import { useLanguage } from '@/components/context/LanguageContext';

const Footer = () => {
  const { dictionary } = useLanguage();
  return (
    <footer className="footer">
      <div className="container-fluid">
        <div className="row text-muted">
          <div className="col-12 text-start">
            <p
              className="mb-0"
              dangerouslySetInnerHTML={{ __html: dictionary.common.footer }}
            ></p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
