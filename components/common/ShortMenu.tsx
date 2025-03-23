import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { faComment } from '@fortawesome/free-regular-svg-icons';

const ShortMenu = () => {
  return (
    <div className="ms-auto short-menu">
      <div className="btn-group">
        <button
          className="btn btn-default btn-sm dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <FontAwesomeIcon icon={faBell} />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            99+
            <span className="visually-hidden">unread messages</span>
          </span>
        </button>
        <ul className="dropdown-menu dropdown-menu-end">
          <li>
            <h6 className="dropdown-header">New Notifications</h6>
          </li>
          <li>
            <div className="row g-0 align-items-baseline px-3 mb-2">
              <div className="col-2">
                <i className="bi-question-circle"></i>
                <FontAwesomeIcon icon={faBell} />
              </div>
              <div className="col-10">
                <div className="blockquote m-0">Update completed</div>
                <div className="text-muted small">
                  Restart server 12 to complete the update.
                </div>
                <div className="text-muted small">30m ago</div>
              </div>
            </div>
          </li>
          <li>
            <div className="row g-0 align-items-baseline px-3 mb-2">
              <div className="col-2">
                <FontAwesomeIcon icon={faCircleQuestion} />
              </div>
              <div className="col-10">
                <div className="blockquote m-0">Update completed</div>
                <div className="text-muted small">
                  Restart server 12 to complete the update.
                </div>
                <div className="text-muted small">30m ago</div>
              </div>
            </div>
          </li>
          <li>
            <div className="row g-0 align-items-baseline px-3">
              <div className="col-2">
                <FontAwesomeIcon icon={faCircleQuestion} />
              </div>
              <div className="col-10">
                <div className="blockquote m-0">Update completed</div>
                <div className="text-muted small">
                  Restart server 12 to complete the update.
                </div>
                <div className="text-muted small">30m ago</div>
              </div>
            </div>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <a className="dropdown-item" href="#">
              Show all notifications
            </a>
          </li>
        </ul>
      </div>
      <div className="btn-group">
        <button
          className="btn btn-default btn-sm dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <FontAwesomeIcon icon={faComment} />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            99+
            <span className="visually-hidden">unread messages</span>
          </span>
        </button>
        <ul className="dropdown-menu dropdown-menu-end">
          <li>
            <h6 className="dropdown-header">New Messages</h6>
          </li>
          <li>
            <div className="row g-0 align-items-baseline px-3 mb-2">
              <div className="col-2">
                <FontAwesomeIcon icon={faCircleQuestion} />
              </div>
              <div className="col-10">
                <div className="blockquote m-0">Update completed</div>
                <div className="text-muted small">
                  Restart server 12 to complete the update.
                </div>
                <div className="text-muted small">30m ago</div>
              </div>
            </div>
          </li>
          <li>
            <div className="row g-0 align-items-baseline px-3 mb-2">
              <div className="col-2">
                <FontAwesomeIcon icon={faCircleInfo} />
              </div>
              <div className="col-10">
                <div className="blockquote m-0">Update completed</div>
                <div className="text-muted small">
                  Restart server 12 to complete the update.
                </div>
                <div className="text-muted small">30m ago</div>
              </div>
            </div>
          </li>
          <li>
            <div className="row g-0 align-items-baseline px-3 ">
              <div className="col-2">
                <FontAwesomeIcon icon={faCircleQuestion} />
              </div>
              <div className="col-10">
                <div className="blockquote m-0">Update completed</div>
                <div className="text-muted small">
                  Restart server 12 to complete the update.
                </div>
                <div className="text-muted small">30m ago</div>
              </div>
            </div>
          </li>
          <li>
            <hr className="dropdown-divider" />
          </li>
          <li>
            <a className="dropdown-item" href="#">
              Show all messages
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ShortMenu;
