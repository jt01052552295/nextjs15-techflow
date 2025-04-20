import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faGear,
  faLock,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { getRouteUrl } from '@/utils/routes';
import Link from 'next/link';
import { useLanguage } from '@/components/context/LanguageContext';
import LogoutButton from '../auth/LogoutButton';
import { formatMessage } from '@/lib/util';

const ShortProfile = () => {
  const { dictionary, locale } = useLanguage();

  return (
    <div className="ms-3">
      <div className="btn-group">
        <button
          className="btn btn-default btn-sm dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <FontAwesomeIcon icon={faUser} />
        </button>
        <ul className="dropdown-menu dropdown-menu-end">
          <li>
            <h6 className="dropdown-header">{dictionary.common.information}</h6>
          </li>
          <li>
            <Link
              className="dropdown-item"
              href={getRouteUrl('my.profile', locale)}
            >
              <FontAwesomeIcon icon={faUser} />
              &nbsp;{dictionary.routes.my.profile.name}
            </Link>
          </li>
          <li>
            <Link
              className="dropdown-item"
              href={getRouteUrl('my.pwd', locale)}
            >
              <FontAwesomeIcon icon={faLock} />
              &nbsp;{dictionary.routes.my.pwd.name}
            </Link>
          </li>
          <li>
            <Link
              className="dropdown-item"
              href={getRouteUrl('my.settings', locale)}
            >
              <FontAwesomeIcon icon={faGear} />
              &nbsp;{dictionary.routes.my.settings.name}
            </Link>
          </li>
          <li>
            <Link
              className="dropdown-item"
              href={getRouteUrl('my.withdraw', locale)}
            >
              <FontAwesomeIcon icon={faRightFromBracket} />
              &nbsp;Signout
            </Link>
          </li>

          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <div className="dropdown-item">
              <LogoutButton variant="dropdown" />
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ShortProfile;
