"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Check, ChevronDown, User, Headphones, Smartphone } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { useLanguage } from '@/context/LanguageContext';
import { getLanguageMeta, languages } from '@/utils/i18n';
import AppLogo from '../shared/AppLogo';
import DemoModal from '../shared/DemoModal';
import DemoToast from '../shared/DemoToast';

type LoginErrors = {
  clientId?: string;
  personalCode?: string;
};

export default function DesktopLogin() {
  const [modal, setModal] = useState<{ title: string; message: string } | null>(null);
  const [toast, setToast] = useState('');
  const [clientId, setClientId] = useState('');
  const [personalCode, setPersonalCode] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
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
      nextErrors.clientId = t("login.errors.clientIdRequired");
    } else if (cleanClientId.length < 6) {
      nextErrors.clientId = t("login.errors.clientIdInvalid");
    }

    if (!cleanPersonalCode) {
      nextErrors.personalCode = t("login.errors.passwordRequired");
    } else if (cleanPersonalCode.length < 4) {
      nextErrors.personalCode = t("login.errors.passwordInvalid");
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
        setLoginError(data.error || t("login.errors.passwordInvalid"));
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
        
        {/* ── HEADER ── */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1002,
            height: '96px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: '44px',
            paddingRight: '44px',
            boxSizing: 'border-box',
          }}
        >
          {/* Logo container wrapper for high visual presence (~54px to 60px height) */}
          <div style={{ display: 'flex', alignItems: 'center', transform: 'scale(1.15)', transformOrigin: 'left center' }}>
            <AppLogo />
          </div>

          {/* Discrete language selector */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsLanguageMenuOpen((value) => !value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
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
              aria-haspopup="true"
              aria-expanded={isLanguageMenuOpen}
            >
              <Image
                src={currentLanguage.flag}
                alt={currentLanguage.code}
                width={24}
                height={16}
                style={{ borderRadius: '3px', objectFit: 'cover' }}
                unoptimized
              />
              <span>{currentLanguage.code}</span>
              <ChevronDown size={16} style={{ color: '#050033' }} aria-hidden="true" />
            </button>
            
            {isLanguageMenuOpen ? (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '44px',
                  zIndex: 1100,
                  width: '240px',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  padding: '8px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                }}
              >
                {languages.map((option) => {
                  const isActive = language === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        setLanguage(option.id);
                        setIsLanguageMenuOpen(false);
                        setErrors({});
                      }}
                      style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        textAlign: 'left',
                        transition: 'background-color 0.15s',
                        border: isActive ? '1px solid #9ACD00' : '1px solid transparent',
                        backgroundColor: isActive ? '#F3FBE4' : 'transparent',
                        color: '#07002F',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                      onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F8FAFC'; }}
                      onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ minWidth: '28px', fontSize: '14px', fontWeight: 700 }}>{option.code}</span>
                        <Image src={option.flag} alt={option.code} width={20} height={20} style={{ borderRadius: '2px', objectFit: 'cover' }} unoptimized />
                        <span style={{ fontWeight: 600 }}>{option.label}</span>
                      </span>
                      {isActive ? <Check style={{ height: '16px', width: '16px', color: '#7FB000' }} /> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </header>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, width: '100%', maxWidth: '1080px', margin: '0 auto', padding: '38px 20px 36px', boxSizing: 'border-box' }}>
          
          {/* ═══════════════════════════════════════════════════
              CARTE LOGIN PRINCIPALE
              ═══════════════════════════════════════════════════ */}
          <div
            style={{
              width: '100%',
              height: '360px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              boxShadow: '0 8px 22px rgba(15, 23, 42, 0.10)',
              position: 'relative',
              padding: '46px 54px',
              display: 'flex',
              alignItems: 'center',
              boxSizing: 'border-box',
            }}
          >
            {/* Absolute positioning link inside card, top right */}
            <button
              type="button"
              onClick={() => setModal({ title: t('login.changeConnectionMode'), message: t('login.loginModeMessage') })}
              style={{
                position: 'absolute',
                top: '28px',
                right: '44px',
                fontSize: '14px',
                color: '#050033',
                textDecoration: 'underline',
                fontWeight: 500,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              {t('login.changeConnectionMode')}
            </button>

            {/* Layout for form and secure access info */}
            <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
              
              {/* Left Column (Form) */}
              <div style={{ width: '610px', flexShrink: 0 }}>
                <form onSubmit={handleSubmit} style={{ width: '610px' }}>
                  
                  {/* Client ID row */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '22px', position: 'relative' }}>
                    <label
                      style={{
                        width: '140px',
                        marginRight: '24px',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#050033',
                        textAlign: 'right',
                      }}
                    >
                      {t('login.clientId')}
                    </label>
                    <div style={{ position: 'relative', width: '410px' }}>
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
                          width: '410px',
                          height: '44px',
                          border: `1px solid ${errors.clientId ? '#B42318' : (clientIdFocus ? '#050033' : '#C8CDD6')}`,
                          borderRadius: '4px',
                          paddingLeft: '16px',
                          paddingRight: '42px',
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
                          right: '-34px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '20px',
                          height: '20px',
                          borderRadius: '999px',
                          backgroundColor: '#050033',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        ?
                      </button>
                      {errors.clientId && (
                        <span style={{ position: 'absolute', bottom: '-18px', left: 0, fontSize: '12px', color: '#B42318', whiteSpace: 'nowrap' }}>
                          {errors.clientId}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Personal Code row */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '22px', position: 'relative' }}>
                    <label
                      style={{
                        width: '140px',
                        marginRight: '24px',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#050033',
                        textAlign: 'right',
                      }}
                    >
                      {t('login.password')}
                    </label>
                    <div style={{ position: 'relative', width: '410px' }}>
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
                          width: '410px',
                          height: '44px',
                          border: `1px solid ${errors.personalCode ? '#B42318' : (personalCodeFocus ? '#050033' : '#C8CDD6')}`,
                          borderRadius: '4px',
                          paddingLeft: '16px',
                          paddingRight: '42px',
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
                          right: '-34px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '20px',
                          height: '20px',
                          borderRadius: '999px',
                          backgroundColor: '#050033',
                          color: '#FFFFFF',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        ?
                      </button>
                      {errors.personalCode && (
                        <span style={{ position: 'absolute', bottom: '-18px', left: 0, fontSize: '12px', color: '#B42318', whiteSpace: 'nowrap' }}>
                          {errors.personalCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {loginError && (
                    <div style={{ marginLeft: '164px', marginBottom: '12px', fontSize: '14px', color: '#B42318', fontWeight: 500 }}>
                      {loginError}
                    </div>
                  )}
                  {/* Buttons row */}
                  <div style={{ display: 'flex', gap: '20px', marginLeft: '164px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isLoading}
                      style={{
                        width: '220px',
                        height: '46px',
                        border: '1px solid #050033',
                        backgroundColor: '#FFFFFF',
                        color: '#050033',
                        borderRadius: '4px',
                        fontSize: '16px',
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
                        width: '220px',
                        height: '46px',
                        border: '1px solid #050033',
                        backgroundColor: '#050033',
                        color: '#FFFFFF',
                        borderRadius: '4px',
                        fontSize: '16px',
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

              {/* Separator */}
              <div style={{ width: '1px', height: '190px', backgroundColor: '#E5E7EB', margin: '0 38px', flexShrink: 0, alignSelf: 'center' }} />

              {/* Right Column (Secure Access validation title block) */}
              <div style={{ width: '290px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', flexShrink: 0, paddingTop: '34px' }}>
                <h2
                  style={{
                    fontSize: '32px',
                    lineHeight: '1.1',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: '#050033',
                    textTransform: 'none',
                    margin: 0,
                  }}
                >
                  {t('login.connectionModeTitle')}
                </h2>
                <p
                  style={{
                    marginTop: '8px',
                    fontSize: '16px',
                    color: '#6B7280',
                    lineHeight: '1.3',
                    margin: 0,
                  }}
                >
                  {t('login.connectionModeSubtitle')}
                </p>
              </div>

            </div>
          </div>

          {/* ═══════════════════════════════════════════════════
              TEXTE ASSISTANCE SOUS LA CARTE
              ═══════════════════════════════════════════════════ */}
          <div
            style={{
              width: '100%',
              marginTop: '32px',
              marginBottom: '28px',
              textAlign: 'center',
              fontSize: '15px',
              lineHeight: '1.65',
              color: '#111827',
            }}
          >
            <p style={{ margin: 0 }}>{t('login.helpTextLine1')}</p>
            <p style={{ margin: '4px 0 0 0' }}>
              {(() => {
                const line2 = t('login.helpTextLine2');
                const phone = "+352 2450 123619";
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
              CARTE PREMIÈRE CONNEXION
              ═══════════════════════════════════════════════════ */}
          <div
            style={{
              width: '100%',
              height: '108px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 42px',
              boxSizing: 'border-box',
              marginTop: '0',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#F3F4F6',
                color: '#050033',
                marginRight: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <User size={30} />
            </div>
            <p style={{ flex: 1, fontSize: '16px', color: '#050033', fontWeight: 500, margin: 0, lineHeight: '1.5' }}>
              {t('login.firstConnectionText')}
            </p>
            <button
              type="button"
              onClick={() => setModal({ title: t('login.firstLoginTitle'), message: t('login.firstLoginMessage') })}
              style={{
                width: '190px',
                height: '44px',
                backgroundColor: '#050033',
                color: '#FFFFFF',
                borderRadius: '4px',
                fontSize: '15px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'opacity 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              {t('login.firstConnectionButton')}
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════
              CARTE AIDE EN LIGNE
              ═══════════════════════════════════════════════════ */}
          <div
            style={{
              width: '100%',
              height: '108px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 42px',
              boxSizing: 'border-box',
              marginTop: '22px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#F3F4F6',
                color: '#050033',
                marginRight: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Headphones size={30} />
            </div>
            <p style={{ flex: 1, fontSize: '16px', color: '#050033', fontWeight: 500, margin: 0, lineHeight: '1.5' }}>
              {t('login.onlineHelpText')}
            </p>
            <button
              type="button"
              onClick={() => setModal({ title: t('login.onlineHelpTitle'), message: t('login.onlineHelpMessage') })}
              style={{
                width: '190px',
                height: '44px',
                backgroundColor: '#050033',
                color: '#FFFFFF',
                borderRadius: '4px',
                fontSize: '15px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'opacity 0.15s',
                flexShrink: 0,
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
              height: '148px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 42px',
              boxSizing: 'border-box',
              marginTop: '22px',
            }}
          >
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: '#F3F4F6',
                color: '#050033',
                marginRight: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Smartphone size={34} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ fontSize: '23px', fontWeight: 700, color: '#050033', margin: '0 0 10px 0' }}>
                {t('login.mobileBankTitle')}
              </h4>
              <p style={{ maxWidth: '520px', fontSize: '14px', lineHeight: '1.5', color: '#374151', margin: 0 }}>
                {t('login.mobileBankText')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '18px', marginLeft: 'auto', flexShrink: 0 }}>
              {/* App Store Badge */}
              <button
                type="button"
                onClick={() => setToast(t('login.storeMessage'))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '150px',
                  height: '44px',
                  backgroundColor: '#050505',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.71 19.5C17.88 20.74 17.02 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 16.99 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" fill="white"/>
                </svg>
                App Store
              </button>

              {/* Google Play Badge */}
              <button
                type="button"
                onClick={() => setToast(t('login.storeMessage'))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '150px',
                  height: '44px',
                  backgroundColor: '#050505',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              BANDEAU PAS ENCORE CLIENT
              ═══════════════════════════════════════════════════ */}
          <div
            style={{
              width: '100%',
              height: '230px',
              marginTop: '32px',
              borderRadius: '6px',
              overflow: 'hidden',
              position: 'relative',
              background: 'linear-gradient(90deg, rgba(15,15,18,0.96), rgba(25,25,30,0.88))',
              boxSizing: 'border-box',
            }}
          >
            {/* Left Content Area */}
            <div style={{ position: 'relative', zIndex: 2, paddingLeft: '52px', paddingTop: '42px', maxWidth: '520px', boxSizing: 'border-box' }}>
              <h3 style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 14px 0' }}>
                {t('login.notClientTitle')}
              </h3>
              <p style={{ fontSize: '16px', lineHeight: '1.55', color: 'rgba(255,255,255,0.86)', margin: 0 }}>
                {t('login.notClientText2')}
              </p>
              <button
                type="button"
                onClick={() => setModal({ title: t('login.openAccountTitle'), message: t('login.openAccountMessage') })}
                style={{
                  marginTop: '24px',
                  width: '180px',
                  height: '46px',
                  backgroundColor: '#FFFFFF',
                  color: '#050033',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.9)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF';
                }}
              >
                {t('login.openAccount')}
              </button>
            </div>

            {/* Right Decorative Area */}
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
              LIEN COOKIES
              ═══════════════════════════════════════════════════ */}
          <div style={{ marginTop: '28px', marginBottom: '34px', textAlign: 'center' }}>
            <span
              role="button"
              tabIndex={0}
              onClick={() => setModal({ title: 'Cookies', message: t('login.cookieMessage') })}
              onKeyDown={(event) => event.key === 'Enter' && setModal({ title: 'Cookies', message: t('login.cookieMessage') })}
              style={{
                display: 'inline-block',
                fontSize: '15px',
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

        </div>
      </div>
      <DemoModal open={Boolean(modal)} title={modal?.title ?? ''} message={modal?.message ?? ''} onClose={() => setModal(null)} />
      <DemoToast open={Boolean(toast)} message={toast} onClose={() => setToast('')} />
    </>
  );
}
