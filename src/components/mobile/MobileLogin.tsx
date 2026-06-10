"use client";

import { useRouter } from 'next/navigation';
import { ChevronDown, User, Headphones, Smartphone, Check } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import AppLogo from '../shared/AppLogo';
import DemoModal from '../shared/DemoModal';
import DemoToast from '../shared/DemoToast';
import { useLanguage } from '@/context/LanguageContext';
import { useNotifications } from '@/context/NotificationContext';
import { getLanguageMeta, languages } from '@/utils/i18n';

type LoginErrors = {
  clientId?: string;
  personalCode?: string;
};

export default function MobileLogin() {
  const [modal, setModal] = useState<{ title: string; message: string } | null>(null);
  const [toast, setToast] = useState('');
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [personalCode, setPersonalCode] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [clientIdFocus, setClientIdFocus] = useState(false);
  const [personalCodeFocus, setPersonalCodeFocus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { addLoginNotification } = useNotifications();
  const currentLanguage = getLanguageMeta(language);

  const validate = () => {
    const nextErrors: LoginErrors = {};
    const cleanClientId = clientId.trim();
    const cleanPersonalCode = personalCode.trim();

    if (!cleanClientId) {
      nextErrors.clientId = t('login.errors.clientIdRequired');
    } else if (cleanClientId.length < 6) {
      nextErrors.clientId = t('login.errors.clientIdInvalid');
    }

    if (!cleanPersonalCode) {
      nextErrors.personalCode = t('login.errors.passwordRequired');
    } else if (cleanPersonalCode.length < 4) {
      nextErrors.personalCode = t('login.errors.passwordInvalid');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: clientId.trim(), password: personalCode.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLoginError(data.error || t('login.errors.passwordInvalid'));
        return;
      }
      addLoginNotification();
      router.push('/dashboard');
    } catch {
      setLoginError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setClientId('');
    setPersonalCode('');
    setErrors({});
  };

  return (
    <>
      <div style={{ minHeight: '100vh', backgroundColor: '#FAFAFA', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>

        {/* ───────────── HEADER MOBILE ───────────── */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            height: '82px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: '20px',
            paddingRight: '20px',
            boxSizing: 'border-box',
          }}
        >
          {/* Logo at left, scaled to look ~42px to 48px high */}
          <div style={{ display: 'flex', alignItems: 'center', transform: 'scale(0.85)', transformOrigin: 'left center' }}>
            <AppLogo compact />
          </div>

          {/* Discrete Language selector at right */}
          <button
            type="button"
            onClick={() => setIsLanguageModalOpen(true)}
            aria-label={t('login.language')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#050033',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '4px',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(5, 0, 51, 0.04)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
          >
            <img
              src={currentLanguage.flag}
              alt={currentLanguage.code}
              style={{ height: '14px', width: '20px', borderRadius: '2px', objectFit: 'cover' }}
            />
            <span>{currentLanguage.code}</span>
            <ChevronDown size={14} style={{ color: '#050033' }} />
          </button>
        </header>

        {/* ───────────── MAIN CONTAINER ───────────── */}
        <main
          style={{
            width: '100%',
            maxWidth: '430px',
            marginLeft: 'auto',
            marginRight: 'auto',
            paddingLeft: '18px',
            paddingRight: '18px',
            paddingTop: '24px',
            paddingBottom: '30px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >

          {/* ═══════════════════════════════════════════════════
              CARTE LOGIN MOBILE
              ═══════════════════════════════════════════════════ */}
          <div
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 8px 22px rgba(15, 23, 42, 0.10)',
              padding: '24px 20px 26px 20px',
              marginBottom: '24px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Changer le mode de connexion Link */}
            <button
              type="button"
              onClick={() => setModal({ title: t('login.changeConnectionMode'), message: t('login.loginModeMessage') })}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'right',
                fontSize: '13px',
                color: '#050033',
                textDecoration: 'underline',
                fontWeight: 500,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                marginBottom: '22px',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              {t('login.changeConnectionMode')}
            </button>

            {/* Title / Info block */}
            <div style={{ textAlign: 'center', marginBottom: '26px' }}>
              <h2
                style={{
                  fontSize: '26px',
                  lineHeight: '1.1',
                  fontWeight: 700,
                  color: '#050033',
                  margin: '0 0 8px 0',
                }}
              >
                {t('login.connectionModeTitle')}
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: '1.45',
                  color: '#6B7280',
                  maxWidth: '280px',
                  margin: '0 auto',
                }}
              >
                {t('login.connectionModeSubtitle')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              
              {/* Client ID field */}
              <div style={{ marginBottom: errors.clientId ? '12px' : '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#050033',
                    marginBottom: '8px',
                  }}
                >
                  {t('login.clientId')}
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(event) => {
                      setClientId(event.target.value);
                      setLoginError('');
                      if (errors.clientId) setErrors((current) => ({ ...current, clientId: undefined }));
                    }}
                    onFocus={() => setClientIdFocus(true)}
                    onBlur={() => setClientIdFocus(false)}
                    placeholder={t('login.clientIdPlaceholder')}
                    style={{
                      width: '100%',
                      height: '46px',
                      border: `1px solid ${errors.clientId ? '#B42318' : (clientIdFocus ? '#050033' : '#C8CDD6')}`,
                      borderRadius: '4px',
                      paddingLeft: '14px',
                      paddingRight: '44px',
                      fontSize: '15px',
                      color: '#050033',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      boxShadow: clientIdFocus ? '0 0 0 2px rgba(5,0,51,0.08)' : 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    aria-label={t('login.forgotId')}
                    onClick={() => setToast(t('login.helpMessage'))}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '22px',
                      height: '22px',
                      borderRadius: '999px',
                      backgroundColor: '#050033',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    ?
                  </button>
                </div>
                {errors.clientId && (
                  <p style={{ fontSize: '12px', color: '#B42318', marginTop: '6px', margin: '6px 0 0 0' }}>
                    {errors.clientId}
                  </p>
                )}
              </div>

              {/* Personal Code field */}
              <div style={{ marginBottom: errors.personalCode ? '12px' : '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#050033',
                    marginBottom: '8px',
                  }}
                >
                  {t('login.password')}
                </label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="password"
                    value={personalCode}
                    onChange={(event) => {
                      setPersonalCode(event.target.value);
                      setLoginError('');
                      if (errors.personalCode) setErrors((current) => ({ ...current, personalCode: undefined }));
                    }}
                    onFocus={() => setPersonalCodeFocus(true)}
                    onBlur={() => setPersonalCodeFocus(false)}
                    placeholder={t('login.passwordPlaceholder')}
                    style={{
                      width: '100%',
                      height: '46px',
                      border: `1px solid ${errors.personalCode ? '#B42318' : (personalCodeFocus ? '#050033' : '#C8CDD6')}`,
                      borderRadius: '4px',
                      paddingLeft: '14px',
                      paddingRight: '44px',
                      fontSize: '15px',
                      color: '#050033',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      boxShadow: personalCodeFocus ? '0 0 0 2px rgba(5,0,51,0.08)' : 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    aria-label={t('login.forgotPassword')}
                    onClick={() => setToast(t('login.helpMessage'))}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '22px',
                      height: '22px',
                      borderRadius: '999px',
                      backgroundColor: '#050033',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    ?
                  </button>
                </div>
                {errors.personalCode && (
                  <p style={{ fontSize: '12px', color: '#B42318', marginTop: '6px', margin: '6px 0 0 0' }}>
                    {errors.personalCode}
                  </p>
                )}
              </div>

              {loginError && (
                <div style={{ marginBottom: '12px', fontSize: '14px', color: '#B42318', fontWeight: 500, textAlign: 'center' }}>
                  {loginError}
                </div>
              )}
              {/* Buttons row */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    height: '46px',
                    border: '1px solid #050033',
                    backgroundColor: '#FFFFFF',
                    color: '#050033',
                    borderRadius: '4px',
                    fontSize: '15px',
                    fontWeight: 500,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (isLoading) return;
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#050033';
                    (e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF';
                    (e.currentTarget as HTMLButtonElement).style.color = '#050033';
                  }}
                >
                  {t('login.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    height: '46px',
                    border: '1px solid #050033',
                    backgroundColor: '#050033',
                    color: '#FFFFFF',
                    borderRadius: '4px',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
                  onMouseLeave={(e) => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
                >
                  {isLoading ? 'Connexion...' : t('login.next')}
                </button>
              </div>

            </form>
          </div>

          {/* ═══════════════════════════════════════════════════
              TEXTE ASSISTANCE
              ═══════════════════════════════════════════════════ */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '22px',
              fontSize: '13px',
              lineHeight: '1.55',
              color: '#111827',
              paddingLeft: '4px',
              paddingRight: '4px',
            }}
          >
            <p style={{ margin: 0 }}>{t('login.helpTextLine1')}</p>
            <p style={{ margin: '4px 0 0 0' }}>
              {(() => {
                const line2 = t('login.helpTextLine2');
                const phone = "+352 2450 1234";
                if (line2.includes(phone)) {
                  const parts = line2.split(phone);
                  return (
                    <>
                      {parts[0]}
                      <span style={{ fontWeight: 700, color: '#050033' }}>{phone}</span>
                      {parts[1]}
                    </>
                  );
                }
                return line2;
              })()}
            </p>
          </div>

          {/* ═══════════════════════════════════════════════════
              CARTE PREMIÈRE CONNEXION MOBILE
              ═══════════════════════════════════════════════════ */}
          <div
            style={{
              width: '100%',
              minHeight: '112px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 6px 18px rgba(15,23,42,0.08)',
              padding: '18px',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '999px',
                  backgroundColor: '#F3F4F6',
                  color: '#050033',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <User size={26} />
              </div>
              <p style={{ flex: 1, fontSize: '14px', lineHeight: '1.4', color: '#050033', fontWeight: 500, margin: 0 }}>
                {t('login.firstConnectionText')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModal({ title: t('login.firstLoginTitle'), message: t('login.firstLoginMessage') })}
              style={{
                width: '100%',
                height: '42px',
                marginTop: '14px',
                backgroundColor: '#050033',
                color: '#FFFFFF',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              {t('login.firstConnectionButton')}
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════
              CARTE AIDE EN LIGNE MOBILE
              ═══════════════════════════════════════════════════ */}
          <div
            style={{
              width: '100%',
              minHeight: '112px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 6px 18px rgba(15,23,42,0.08)',
              padding: '18px',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '999px',
                  backgroundColor: '#F3F4F6',
                  color: '#050033',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Headphones size={26} />
              </div>
              <p style={{ flex: 1, fontSize: '14px', lineHeight: '1.4', color: '#050033', fontWeight: 500, margin: 0 }}>
                {t('login.onlineHelpText')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModal({ title: t('login.onlineHelpTitle'), message: t('login.onlineHelpMessage') })}
              style={{
                width: '100%',
                height: '42px',
                marginTop: '14px',
                backgroundColor: '#050033',
                color: '#FFFFFF',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              {t('login.onlineHelpButton')}
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════
              CARTE APPLICATION MOBILE
              ═══════════════════════════════════════════════════ */}
          <div
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 6px 18px rgba(15,23,42,0.08)',
              padding: '20px 18px',
              marginBottom: '22px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#F3F4F6',
                  color: '#050033',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Smartphone size={26} />
              </div>
              <h4 style={{ flex: 1, fontSize: '19px', fontWeight: 700, color: '#050033', lineHeight: 1.25, margin: 0 }}>
                {t('login.mobileBankTitle')}
              </h4>
            </div>
            <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#374151', marginTop: '10px', marginBottom: 0 }}>
              {t('login.mobileBankText')}
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              {/* App Store badge */}
              <button
                type="button"
                onClick={() => setToast(t('login.storeMessage'))}
                style={{
                  flex: 1,
                  height: '42px',
                  backgroundColor: '#050505',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.71 19.5C17.88 20.74 17.02 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 16.99 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" fill="white"/>
                </svg>
                App Store
              </button>
              {/* Google Play badge */}
              <button
                type="button"
                onClick={() => setToast(t('login.storeMessage'))}
                style={{
                  flex: 1,
                  height: '42px',
                  backgroundColor: '#050505',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.18 23.49C2.99 23.33 2.88 23.06 2.88 22.69V1.31C2.88 0.93 3 0.66 3.2 0.5L13.04 11.99L3.18 23.49Z" fill="#4285F4"/>
                  <path d="M17.05 15.97L13.04 11.99L17.05 8.01L21.62 10.56C22.68 11.14 22.68 12.84 21.62 13.43L17.05 15.97Z" fill="#FBBC04"/>
                  <path d="M13.04 11.99L3.2 0.5C3.44 0.3 3.78 0.26 4.18 0.48L17.05 8.01L13.04 11.99Z" fill="#34A853"/>
                  <path d="M13.04 11.99L17.05 15.97L4.18 23.5C3.78 23.72 3.44 23.68 3.18 23.49L13.04 11.99Z" fill="#EA4335"/>
                </svg>
                Google Play
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              BANDEAU PAS ENCORE CLIENT MOBILE
              ═══════════════════════════════════════════════════ */}
          <div
            style={{
              width: '100%',
              minHeight: '220px',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
              padding: '26px 22px',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #151518 0%, #25252A 100%)',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ position: 'relative', zIndex: 10 }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 12px 0' }}>
                {t('login.notClientTitle')}
              </h2>
              <p style={{ fontSize: '14px', lineHeight: '1.55', color: 'rgba(255,255,255,0.86)', margin: 0 }}>
                {t('login.notClientText2')}
              </p>
              <button
                type="button"
                onClick={() => setModal({ title: t('login.openAccountTitle'), message: t('login.openAccountMessage') })}
                style={{
                  marginTop: '20px',
                  width: '170px',
                  height: '44px',
                  backgroundColor: '#FFFFFF',
                  color: '#050033',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              >
                {t('login.openAccount')}
              </button>
            </div>

            {/* Subtly transparent right graphic decoration */}
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '52%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 80%)',
                opacity: 0.3,
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* ═══════════════════════════════════════════════════
              LIEN COOKIES MOBILE
              ═══════════════════════════════════════════════════ */}
          <div style={{ textAlign: 'center', marginTop: '6px', marginBottom: '28px' }}>
            <span
              role="button"
              tabIndex={0}
              onClick={() => setModal({ title: 'Cookies', message: t('login.cookieMessage') })}
              onKeyDown={(event) => event.key === 'Enter' && setModal({ title: 'Cookies', message: t('login.cookieMessage') })}
              style={{
                display: 'inline-block',
                fontSize: '14px',
                color: '#050033',
                textDecoration: 'underline',
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.opacity = '0.7'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.opacity = '1'; }}
            >
              {t('login.cookieLearnMore')}
            </span>
          </div>

        </main>
      </div>

      <DemoModal open={Boolean(modal)} title={modal?.title ?? ''} message={modal?.message ?? ''} onClose={() => setModal(null)} />
      <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />

      {/* ───────────── LANGUAGE MODAL ───────────── */}
      {isLanguageModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '16px',
            boxSizing: 'border-box',
          }}
          onClick={() => setIsLanguageModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#050033', margin: '0 0 8px 0' }}>{t('login.language')}</h2>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px 0' }}>
              {t('login.chooseLanguage')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {languages.map((lang) => {
                const isSelected = language === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.id);
                      setIsLanguageModalOpen(false);
                      setErrors({});
                    }}
                    style={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '14px',
                      border: isSelected ? '1px solid #9ACD00' : '1px solid #E5E7EB',
                      padding: '16px',
                      textAlign: 'left',
                      transition: 'colors 0.15s',
                      backgroundColor: isSelected ? '#EEF7D8' : '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={lang.flag} alt={lang.code} style={{ height: '24px', width: '32px', borderRadius: '4px', objectFit: 'cover', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                      <div>
                        <span style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#090927' }}>{lang.label}</span>
                        <span style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                          {isSelected ? t('login.currentLanguage') : t('login.availableLanguage')}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check size={20} style={{ color: '#7AA600' }} />}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setIsLanguageModalOpen(false)}
                style={{
                  height: '40px',
                  width: '100%',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F9FAFB'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF'; }}
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
