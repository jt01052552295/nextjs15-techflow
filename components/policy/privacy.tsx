'use client';
import { useLanguage } from '@/components/context/LanguageContext';

const PrivacyComponent = () => {
  const { dictionary } = useLanguage();
  const { policy } = dictionary.common;
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="mb-4">{policy.privacy.title}</h5>

        <section className="mb-5">
          <h6 className="mb-3">{policy.privacy.section1.title}</h6>
          <p>{policy.privacy.section1.content}</p>
        </section>

        <section className="mb-5">
          <h6 className="mb-3">{policy.privacy.section2.title}</h6>
          <p>{policy.privacy.section2.content}</p>
          <ul className="list-group list-group-flush mt-3">
            {policy.privacy.section2.items.map(
              (item: string, index: number) => (
                <li key={index} className="list-group-item">
                  {item}
                </li>
              ),
            )}
          </ul>
        </section>

        <section className="mb-5">
          <h6 className="mb-3">{policy.privacy.section3.title}</h6>
          <p>{policy.privacy.section3.content}</p>
        </section>

        <section className="mb-5">
          <h6 className="mb-3">{policy.privacy.section4.title}</h6>
          <p>{policy.privacy.section4.content}</p>
        </section>

        <section className="mb-5">
          <h6 className="mb-3">{policy.privacy.section5.title}</h6>
          <p>{policy.privacy.section5.content}</p>
        </section>

        <section className="mb-5">
          <h6 className="mb-3">{policy.privacy.section6.title}</h6>
          <p>{policy.privacy.section6.content}</p>
        </section>

        <div className="text-end mt-4">
          <p>
            {policy.privacy.lastUpdated}: {policy.privacy.lastUpdatedDate}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyComponent;
