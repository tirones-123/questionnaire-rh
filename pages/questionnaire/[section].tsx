import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { sections, responseOptions } from '../../data/questions';

interface QuestionnaireData {
  [key: string]: string;
}

export default function QuestionnairePage() {
  const router = useRouter();
  const { section } = router.query;
  const sectionId = parseInt(section as string);
  
  const [responses, setResponses] = useState<QuestionnaireData>({});
  const [userInfo, setUserInfo] = useState<{firstName: string; lastName: string} | null>(null);
  const [error, setError] = useState<string>('');

  const currentSection = sections.find(s => s.id === sectionId);

  useEffect(() => {
    // Vérifier les informations utilisateur
    const storedUserInfo = localStorage.getItem('user-info');
    if (!storedUserInfo) {
      router.push('/');
      return;
    }
    setUserInfo(JSON.parse(storedUserInfo));

    // Charger les réponses existantes
    const existingData = localStorage.getItem('questionnaire-data');
    if (existingData) {
      setResponses(JSON.parse(existingData));
    }
  }, [router]);

  const handleResponseChange = (questionId: number, value: string) => {
    const newResponses = {
      ...responses,
      [`${sectionId}-${questionId}`]: value
    };
    setResponses(newResponses);
    localStorage.setItem('questionnaire-data', JSON.stringify(newResponses));
    setError('');
  };

  const validateCurrentSection = (): boolean => {
    if (!currentSection) return false;
    
    for (const question of currentSection.questions) {
      if (!responses[`${sectionId}-${question.id}`]) {
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentSection()) {
      setError('Veuillez répondre à toutes les questions avant de continuer.');
      return;
    }

    if (sectionId === 8) {
      router.push('/complete');
    } else {
      router.push(`/questionnaire/${sectionId + 1}`);
    }
  };

  const handlePrevious = () => {
    if (sectionId === 1) {
      router.push('/');
    } else {
      router.push(`/questionnaire/${sectionId - 1}`);
    }
  };

  const calculateProgress = (): number => {
    return (sectionId / 8) * 100;
  };

  if (!currentSection || !userInfo) {
    return <div>Chargement...</div>;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="hero-section" style={{ padding: '1rem' }}>
      </div>
      
      <div className="container" style={{ marginTop: '-1rem', position: 'relative', zIndex: 2, paddingBottom: '4rem' }}>
        <div className="glass-card" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        <div className="section-info">
          Section {sectionId} / 8
        </div>

        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Version Desktop - Tableau Likert */}
        <div className="likert-table-container desktop-only">
          <table className="likert-table">
            <thead>
              <tr>
                <th>Situation professionnelle</th>
                {responseOptions.map(option => (
                  <th key={option.value}>
                    {option.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentSection.questions.map(question => (
                <tr key={question.id}>
                  <td>{question.text}</td>
                  {responseOptions.map(option => (
                    <td key={option.value}>
                      <label htmlFor={`q${question.id}-${option.value}`} style={{ cursor: 'pointer', display: 'block' }}>
                        <input
                          type="radio"
                          id={`q${question.id}-${option.value}`}
                          name={`question-${question.id}`}
                          value={option.value}
                          checked={responses[`${sectionId}-${question.id}`] === option.value}
                          onChange={() => handleResponseChange(question.id, option.value)}
                          className="radio-input"
                          aria-label={`${question.text} - ${option.label}`}
                        />
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Version Mobile - Questions individuelles */}
        <div className="mobile-questions mobile-only">
          {currentSection.questions.map((question, index) => (
            <div key={question.id} className="mobile-question-card">
              <div className="mobile-question-header">
                <span className="question-number">Question {index + 1} / {currentSection.questions.length}</span>
              </div>
              
              <div className="mobile-question-text">
                {question.text}
              </div>
              
              <div className="mobile-options">
                {responseOptions.map(option => (
                   <button
                     key={option.value}
                     type="button"
                     className={`mobile-option-button ${responses[`${sectionId}-${question.id}`] === option.value ? 'selected' : ''}`}
                     onClick={() => handleResponseChange(question.id, option.value)}
                   >
                     <span className="option-label">{option.label}</span>
                   </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="navigation-buttons">
          <button 
            type="button" 
            onClick={handlePrevious}
            className="secondary-button"
          >
            ← Précédent
          </button>
          
          <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
            {Object.keys(responses).filter(key => key.startsWith(`${sectionId}-`)).length} / {currentSection.questions.length} réponses
          </div>
          
          <button 
            type="button" 
            onClick={handleNext}
            className="primary-button"
          >
            {sectionId === 8 ? 'Terminer' : 'Suivant →'}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
} 