'use client';
import { useLanguage } from '@/components/context/LanguageContext';

const TermsComponent = () => {
  const { dictionary } = useLanguage();
  const { policy } = dictionary.common;
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="mb-4">{policy.terms.title}</h5>

        <section className="mb-5">
          <h6 className="mb-3">{policy.terms.section1.title}</h6>
          <p>{policy.terms.section1.content}</p>
        </section>

        <section className="mb-5">
          <h6 className="mb-3">{policy.terms.section2.title}</h6>
          <p>{policy.terms.section2.content}</p>
          <ul className="list-group list-group-flush mt-3">
            {policy.terms.section2.items.map((item: string, index: number) => (
              <li key={index} className="list-group-item">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-5">
          <h6 className="mb-3">{policy.terms.section3.title}</h6>
          <p>{policy.terms.section3.content}</p>
        </section>

        <section className="mb-5">
          <h6 className="mb-3">{policy.terms.section4.title}</h6>
          <p>{policy.terms.section4.content}</p>
        </section>

        <section className="mb-5">
          <h6 className="mb-3">{policy.terms.section5.title}</h6>
          <p>{policy.terms.section5.content}</p>
        </section>

        <section className="mb-5">
          <h6 className="mb-3">{policy.terms.section6.title}</h6>
          <p>{policy.terms.section6.content}</p>
        </section>

        <div className="text-end mt-4">
          <p>
            {policy.terms.lastUpdated}: {policy.terms.lastUpdatedDate}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsComponent;
