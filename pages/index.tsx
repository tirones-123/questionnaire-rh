import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface UserInfo {
  firstName: string;
  lastName: string;
}

export default function Home() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: '',
    lastName: ''
  });
  const [hasExistingData, setHasExistingData] = useState(false);

  useEffect(() => {
    // Vérifier s'il y a des données existantes
    const existingData = localStorage.getItem('questionnaire-data');
    if (existingData) {
      setHasExistingData(true);
    }

    // Pré-remplir les champs nom/prénom s'ils existent
    const existingUserInfo = localStorage.getItem('user-info');
    if (existingUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(existingUserInfo);
        setUserInfo({
          firstName: parsedUserInfo.firstName || '',
          lastName: parsedUserInfo.lastName || ''
        });
      } catch (error) {
        console.log('Erreur lors du chargement des informations utilisateur:', error);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInfo.firstName.trim() && userInfo.lastName.trim()) {
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
    if (userInfo.firstName.trim() && userInfo.lastName.trim()) {
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

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="hero-section">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>

          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            Questionnaire RH
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '0.5rem' }}>
            Analyse et développement du potentiel
          </p>
                     <p style={{ fontSize: '1rem', opacity: 0.8 }}>
             72 questions • 8 sections • 10 minutes
           </p>
         </div>
       </div>
       
       <div className="container" style={{ marginTop: '-2rem', position: 'relative', zIndex: 2, paddingBottom: '4rem' }}>
         <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem' }}>

          <div style={{ 
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)', 
            border: '1px solid rgba(102, 126, 234, 0.2)', 
            padding: '2rem', 
            borderRadius: '15px',
            fontSize: '1rem',
            lineHeight: '1.7',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>📋</div>
            <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
              Ce questionnaire d'analyse et de développement du potentiel présente <strong>72 questions</strong> faisant référence à des situations courantes de la vie professionnelle.
            </p>
            <p style={{ marginBottom: '1rem', color: '#4b5563' }}>
              Pour la validité du questionnaire, répondez à chaque question en cochant la case 
              correspondant à votre choix. N'hésitez pas à cocher les cases extrêmes en évitant 
              autant que possible la réponse intermédiaire.
            </p>
          </div>

          {hasExistingData && (
            <div className="warning-text" style={{ marginBottom: '2rem' }}>
              <p><strong>Reprise détectée :</strong> Vous avez déjà commencé ce questionnaire.</p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  onClick={handleResume}
                  disabled={!userInfo.firstName.trim() || !userInfo.lastName.trim()}
                  className="primary-button"
                  style={{ flex: 1, minWidth: '120px' }}
                >
                  Reprendre
                </button>
                <button 
                  type="button" 
                  onClick={handleRestart}
                  className="secondary-button"
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
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
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
            />
          </div>

          <button 
            type="submit" 
            className="primary-button" 
            style={{ width: '100%' }}
            disabled={!userInfo.firstName.trim() || !userInfo.lastName.trim()}
          >
            {hasExistingData ? 'Reprendre le questionnaire' : 'Commencer le questionnaire'}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
} 