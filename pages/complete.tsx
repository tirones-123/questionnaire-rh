import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';

export default function Complete() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [evaluationMode, setEvaluationMode] = useState(false);

  useEffect(() => {
    // Vérifier si on est en mode évaluation
    const urlParams = new URLSearchParams(window.location.search);
    setEvaluationMode(urlParams.get('mode') === 'evaluation');
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Récupérer les données
      const dataKey = evaluationMode ? 'evaluation-data' : 'questionnaire-data';
      const infoKey = evaluationMode ? 'evaluation-info' : 'user-info';
      
      const responses = localStorage.getItem(dataKey);
      const info = localStorage.getItem(infoKey);

      if (!responses || !info) {
        throw new Error('Données manquantes');
      }

      const endpoint = evaluationMode ? '/api/submit-evaluation' : '/api/submit-questionnaire';
      const body = evaluationMode 
        ? {
            evaluationInfo: JSON.parse(info),
            responses: JSON.parse(responses)
          }
        : {
            userInfo: JSON.parse(info),
            responses: JSON.parse(responses)
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      setIsSubmitted(true);
      
      // Nettoyer le localStorage après envoi réussi
      localStorage.removeItem(dataKey);
      localStorage.removeItem(infoKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    const dataKey = evaluationMode ? 'evaluation-data' : 'questionnaire-data';
    const infoKey = evaluationMode ? 'evaluation-info' : 'user-info';
    
    localStorage.removeItem(dataKey);
    localStorage.removeItem(infoKey);
    
    if (evaluationMode) {
      router.push('/evaluation');
    } else {
      router.push('/');
    }
  };

  if (isSubmitted) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Logo />
          <div style={{ 
            backgroundColor: '#10b981', 
            color: 'white', 
            padding: '1rem', 
            borderRadius: '50%', 
            width: '80px', 
            height: '80px', 
            margin: '2rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem'
          }}>
            ✓
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            {evaluationMode ? 'Évaluation envoyée avec succès !' : 'Questionnaire envoyé avec succès !'}
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            📊 Le fichier Excel avec toutes les réponses a été envoyé.<br/><br/>
            📝 <strong>Le rapport d'analyse détaillé sera généré et envoyé dans un second email d'ici quelques minutes.</strong>
          </p>
          <p style={{ fontSize: '0.95rem', color: '#6b7280', marginTop: '2rem' }}>
            Les documents seront envoyés à : <strong>luc.marsal@auramanagement.fr</strong>
          </p>
          <button 
            onClick={handleRestart}
            className="primary-button"
            style={{ marginTop: '2rem' }}
          >
            {evaluationMode ? 'Nouvelle évaluation' : 'Nouveau questionnaire'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '4rem 2rem' }}>
        <Logo />
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {evaluationMode ? 'Évaluation terminée' : 'Questionnaire terminé'}
        </h1>
        
        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '2rem', 
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>Félicitations !</h2>
          <p style={{ marginBottom: '1rem' }}>
            {evaluationMode 
              ? 'Vous avez répondu à toutes les questions de l\'évaluation.'
              : 'Vous avez répondu à toutes les questions du questionnaire.'}
          </p>
          <p>
            Cliquez sur le bouton ci-dessous pour envoyer vos réponses. 
            Vous recevrez :
          </p>
          <ul style={{ marginTop: '1rem', marginLeft: '2rem' }}>
            <li>Un <strong>email immédiat</strong> avec le fichier Excel contenant toutes les réponses</li>
            <li>Un <strong>second email</strong> (sous quelques minutes) avec le rapport d'analyse complet</li>
          </ul>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: '#fee', 
            color: '#dc2626', 
            padding: '1rem', 
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            <strong>Erreur :</strong> {error}
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Veuillez réessayer ou contacter le support si le problème persiste.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="primary-button"
            style={{ 
              width: '100%',
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer les réponses'}
          </button>
          
          <button 
            onClick={handleRestart}
            className="secondary-button"
            disabled={isSubmitting}
            style={{ width: '100%' }}
          >
            Recommencer
          </button>
        </div>
      </div>
    </div>
  );
} 