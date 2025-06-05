import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface UserInfo {
  firstName: string;
  lastName: string;
}

export default function CompletePage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Vérifier les informations utilisateur
    const storedUserInfo = localStorage.getItem('user-info');
    if (!storedUserInfo) {
      router.push('/');
      return;
    }
    setUserInfo(JSON.parse(storedUserInfo));

    // Vérifier que toutes les réponses sont complètes
    const existingData = localStorage.getItem('questionnaire-data');
    if (!existingData) {
      router.push('/');
      return;
    }

    const responses = JSON.parse(existingData);
    const totalQuestions = 8 * 9; // 8 sections × 9 questions
    const answeredQuestions = Object.keys(responses).length;
    
    if (answeredQuestions < totalQuestions) {
      router.push('/questionnaire/1');
      return;
    }
  }, [router]);

  const handleSubmit = async () => {
    if (!userInfo) return;

    setIsSubmitting(true);
    setError('');

    try {
      const responses = JSON.parse(localStorage.getItem('questionnaire-data') || '{}');
      
      const response = await fetch('/api/submit-questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInfo,
          responses
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsComplete(true);
        // Nettoyer les données locales après envoi réussi
        localStorage.removeItem('questionnaire-data');
        localStorage.removeItem('user-info');
      } else {
        throw new Error(result.error || 'Erreur lors de l\'envoi');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi des réponses');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userInfo) {
    return <div>Chargement...</div>;
  }

  if (isComplete) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <div className="hero-section">
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
              Mission accomplie !
            </h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
              Questionnaire envoyé avec succès
            </p>
          </div>
        </div>
        
        <div className="container" style={{ marginTop: '-2rem', position: 'relative', zIndex: 2, paddingBottom: '4rem' }}>
          <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem', textAlign: 'center' }}>
          
          <div className="success-message">
            <p><strong>Vos réponses ont bien été transmises.</strong></p>
            <p>Vous pouvez fermer cette page.</p>
          </div>
          
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '2rem' }}>
              Merci {userInfo.firstName} {userInfo.lastName} d'avoir pris le temps de répondre à ce questionnaire.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="hero-section">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            Questionnaire terminé !
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Dernière étape : envoi de vos réponses
          </p>
        </div>
      </div>
      
      <div className="container" style={{ marginTop: '-2rem', position: 'relative', zIndex: 2, paddingBottom: '4rem' }}>
        <div className="glass-card complete-card">
        
        <div className="complete-info">
          <p className="complete-congratulations">
            <strong>Félicitations {userInfo.firstName} {userInfo.lastName} !</strong>
          </p>
          <p className="complete-description">
            Vous avez répondu aux 72 questions du questionnaire.
          </p>
          <p className="complete-instruction">
            Cliquez sur le bouton ci-dessous pour envoyer vos réponses.
          </p>
        </div>

        {error && (
          <div className="error-message">
            <p><strong>Erreur :</strong> {error}</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Veuillez réessayer ou contacter le support si le problème persiste.
            </p>
          </div>
        )}

        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="primary-button"
          style={{ 
            fontSize: '1.125rem', 
            padding: '1rem 2rem',
            width: '100%',
            marginBottom: '1rem'
          }}
        >
          {isSubmitting ? 'Envoi en cours...' : 'Envoyer mes réponses'}
        </button>

        <button 
          onClick={() => router.push('/questionnaire/8')}
          disabled={isSubmitting}
          className="secondary-button"
          style={{ 
            fontSize: '1rem', 
            padding: '0.75rem 2rem',
            width: '100%',
            marginBottom: '1rem'
          }}
        >
          ← Précédent
        </button>

        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Vos réponses seront envoyées directement.
        </p>
        </div>
      </div>
    </div>
  );
} 