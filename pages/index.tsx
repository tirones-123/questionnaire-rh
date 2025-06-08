import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface UserInfo {
  firstName: string;
  lastName: string;
  age: string;
  profession: string;
  email: string;
}

export default function Home() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '',
    lastName: '',
    age: '',
    profession: '',
    email: ''
  });
  const [hasExistingData, setHasExistingData] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  useEffect(() => {
    // Vérifier s'il y a des données existantes
    const existingData = localStorage.getItem('questionnaire-data');
    if (existingData) {
      setHasExistingData(true);
    }

    // Pré-remplir les champs nom/prénom/email s'ils existent
    const existingUserInfo = localStorage.getItem('user-info');
    if (existingUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(existingUserInfo);
        setUserInfo({
          firstName: parsedUserInfo.firstName || '',
          lastName: parsedUserInfo.lastName || '',
          age: parsedUserInfo.age || '',
          profession: parsedUserInfo.profession || '',
          email: parsedUserInfo.email || ''
        });
      } catch (error) {
        console.log('Erreur lors du chargement des informations utilisateur:', error);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInfo.firstName.trim() && userInfo.lastName.trim() && userInfo.age.trim() && userInfo.profession.trim() && userInfo.email.trim() && consentAccepted) {
      // Sauvegarder les informations utilisateur
      localStorage.setItem('user-info', JSON.stringify(userInfo));
      router.push('/questionnaire/1');
    }
  };

  const handleRestart = () => {
    localStorage.removeItem('questionnaire-data');
    localStorage.removeItem('user-info');
    setHasExistingData(false);
  };

  const handleResume = () => {
    if (userInfo.firstName.trim() && userInfo.lastName.trim() && userInfo.age.trim() && userInfo.profession.trim() && userInfo.email.trim() && consentAccepted) {
      localStorage.setItem('user-info', JSON.stringify(userInfo));
      // Trouver la dernière section complétée
      const existingData = JSON.parse(localStorage.getItem('questionnaire-data') || '{}');
      let lastCompletedSection = 0;
      for (let i = 1; i <= 8; i++) {
        const sectionComplete = Object.keys(existingData).filter(key => 
          key.startsWith(`${i}-`)
        ).length === 9;
        if (sectionComplete) {
          lastCompletedSection = i;
        } else {
          break;
        }
      }
      const nextSection = Math.min(lastCompletedSection + 1, 8);
      router.push(`/questionnaire/${nextSection}`);
    }
  };

  const isFormValid = userInfo.firstName.trim() && userInfo.lastName.trim() && userInfo.age.trim() && userInfo.profession.trim() && userInfo.email.trim() && consentAccepted;

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="hero-section" style={{ padding: '1.5rem 2rem' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>

          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.75rem', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            QAP
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '0.75rem', fontWeight: '600' }}>
          Questionnaire d’analyse du potentiel : autodiagnostic
          </p>
          <p style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '1.5rem' }}>
            72 questions • 8 sections • 10 minutes
          </p>
          
          {/* Processus d'analyse dans le hero */}
          <div className="process-container desktop-only" style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)', 
            padding: '0.5rem', 
            borderRadius: '10px',
            marginBottom: '0.25rem'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              fontSize: '0.75rem',
              flexWrap: 'wrap'
            }}>
              <div className="process-step" style={{ 
                background: 'rgba(255, 255, 255, 0.9)', 
                color: '#1d4e89',
                borderRadius: '6px', 
                padding: '0.3rem 0.6rem',
                fontWeight: '600',
                fontSize: '0.75rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: '#667eea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '8px',
                  fontWeight: 'bold'
                }}>✓</div>
                Questionnaire en ligne
              </div>
              <div className="process-arrow" style={{ 
                fontSize: '0.9rem', 
                color: 'white',
                fontWeight: 'bold'
              }}>→</div>
              <div className="process-step" style={{ 
                background: 'rgba(255, 255, 255, 0.9)', 
                color: '#1d4e89',
                borderRadius: '6px', 
                padding: '0.3rem 0.6rem',
                fontWeight: '600',
                fontSize: '0.75rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: '#8b5cf6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '8px',
                  fontWeight: 'bold'
                }}>📊</div>
                Analyse des résultats
              </div>
              <div className="process-arrow" style={{ 
                fontSize: '0.9rem', 
                color: 'white',
                fontWeight: 'bold'
              }}>→</div>
              <div className="process-step" style={{ 
                background: 'rgba(255, 255, 255, 0.9)', 
                color: '#1d4e89',
                borderRadius: '6px', 
                padding: '0.3rem 0.6rem',
                fontWeight: '600',
                fontSize: '0.75rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '8px',
                  fontWeight: 'bold'
                }}>👤</div>
                Validation par un expert
              </div>
              <div className="process-arrow" style={{ 
                fontSize: '0.9rem', 
                color: 'white',
                fontWeight: 'bold'
              }}>→</div>
              <div className="process-step" style={{ 
                background: 'rgba(255, 255, 255, 0.9)', 
                color: '#1d4e89',
                borderRadius: '6px', 
                padding: '0.3rem 0.6rem',
                fontWeight: '600',
                fontSize: '0.75rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '8px',
                  fontWeight: 'bold'
                }}>↗</div>
                Rapport sous 24/48h
              </div>
            </div>
          </div>
         </div>
       </div>
       
       <div className="container" style={{ marginTop: '-1rem', position: 'relative', zIndex: 2, paddingBottom: '4rem' }}>
         <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto', padding: '2.5rem' }}>

          <div style={{ 
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)', 
            border: '1px solid rgba(102, 126, 234, 0.2)', 
            padding: '1.5rem', 
            borderRadius: '15px',
            fontSize: '1rem',
            lineHeight: '1.7',
            marginBottom: '2rem'
          }}>

            <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
              Ce questionnaire d'analyse et de développement du potentiel présente <strong>72 questions</strong> faisant référence à des situations courantes de la vie professionnelle.
            </p>
            <p style={{ marginBottom: '0', color: '#4b5563' }}>
              Pour la validité du questionnaire, répondez à chaque question en cochant la case 
              correspondant à votre choix. N'hésitez pas à cocher les cases extrêmes en évitant 
              autant que possible la réponse intermédiaire.
            </p>
          </div>

          {hasExistingData && (
            <div className="warning-text" style={{ marginBottom: '2rem' }}>
              <p><strong>Reprise détectée :</strong> Vous avez déjà commencé ce questionnaire.</p>
              <div style={{ 
                marginTop: '1rem', 
                display: 'flex', 
                gap: '1rem', 
                flexDirection: 'row',
                flexWrap: 'wrap'
              }}>
                <button 
                  type="button" 
                  onClick={handleResume}
                  disabled={!isFormValid}
                  className="primary-button resume-button"
                  style={{ flex: 1, minWidth: '120px' }}
                >
                  Reprendre
                </button>
                <button 
                  type="button" 
                  onClick={handleRestart}
                  className="secondary-button restart-button"
                  style={{ flex: 1, minWidth: '120px' }}
                >
                  Recommencer
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="firstName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Prénom *
            </label>
            <input
              type="text"
              id="firstName"
              value={userInfo.firstName}
              onChange={(e) => setUserInfo(prev => ({ ...prev, firstName: e.target.value }))}
              className="input-field"
              required
              autoComplete="given-name"
              placeholder="Votre prénom"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="lastName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Nom *
            </label>
            <input
              type="text"
              id="lastName"
              value={userInfo.lastName}
              onChange={(e) => setUserInfo(prev => ({ ...prev, lastName: e.target.value }))}
              className="input-field"
              required
              autoComplete="family-name"
              placeholder="Votre nom"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="age" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Âge *
            </label>
            <input
              type="number"
              id="age"
              value={userInfo.age}
              onChange={(e) => setUserInfo(prev => ({ ...prev, age: e.target.value }))}
              className="input-field"
              required
              min="16"
              max="99"
              placeholder="Votre âge"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="profession" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Profession *
            </label>
            <input
              type="text"
              id="profession"
              value={userInfo.profession}
              onChange={(e) => setUserInfo(prev => ({ ...prev, profession: e.target.value }))}
              className="input-field"
              required
              placeholder="Votre profession"
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Adresse e-mail *
            </label>
            <input
              type="email"
              id="email"
              value={userInfo.email}
              onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
              className="input-field"
              required
              autoComplete="email"
              placeholder="votre@email.com"
            />
          </div>

          {/* Section Confidentialité */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)', 
            border: '1px solid rgba(102, 126, 234, 0.2)', 
            padding: '1.5rem', 
            borderRadius: '15px',
            marginBottom: '0.5rem'
          }}>
            <h3 style={{ 
              fontSize: '1.2rem', 
              marginBottom: '1rem', 
              color: '#4b5563',
              fontWeight: '600'
            }}>
              Confidentialité de vos réponses
            </h3>
            <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4b5563', marginBottom: '1.5rem' }}>
              <p style={{ marginBottom: '1rem' }}>
                Vos données sont collectées par notre cabinet. Après analyse, elles permettront de
                générer votre rapport d'autodiagnostic. Supervisé par un expert, ce rapport sera envoyé (sous
                24 à 48 heures) à l'adresse e-mail que vous indiquez et uniquement à cette adresse. Libre à
                vous ensuite de le partager.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <input
                type="checkbox"
                id="consent"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  accentColor: '#667eea',
                  marginTop: '2px'
                }}
                required
              />
              <label htmlFor="consent" style={{ 
                fontSize: '0.95rem', 
                color: '#4b5563',
                fontWeight: '500',
                cursor: 'pointer',
                flex: 1
              }}>
                J'ai lu et compris la mention relative à la confidentialité de mes réponses.
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="primary-button" 
            style={{ width: '100%', marginTop: '1.5rem' }}
            disabled={!isFormValid}
          >
            {hasExistingData ? 'Reprendre le questionnaire' : 'Commencer le questionnaire'}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
} 