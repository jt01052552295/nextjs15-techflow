'use client';
import { useLanguage } from '@/components/context/LanguageContext';
import { useAuth } from '@/components/context/AuthContext';
import { useEffect, useState } from 'react';
import SocialConnect from './SocialConntect';

const SettingForm = () => {
  const { dictionary, locale, t } = useLanguage();
  const { user, refreshUser, userProfiles, updateUserProfiles } = useAuth();

  return (
    <div className="row justify-content-center">
      <div className="col-md-12">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title m-0">{t('common.basic_info')}</h5>
          </div>
          <div className="card-body">
            <SocialConnect />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingForm;
