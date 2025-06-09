import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';

interface EvaluatedPersonInfo {
  firstName: string;
  lastName: string;
  position: string;
  ageRange: string;
}

interface EvaluatorInfo {
  relationship: string;
  hierarchyLevel?: string;
}

interface EvaluationData {
  evaluatedPerson: EvaluatedPersonInfo;
  evaluator: EvaluatorInfo;
  evaluatorEmail: string;
}

export default function Evaluation() {
  const router = useRouter();
  const [evaluatedPerson, setEvaluatedPerson] = useState<EvaluatedPersonInfo>({
    firstName: '',
    lastName: '',
    position: '',
    ageRange: ''
  });
  
  const [evaluator, setEvaluator] = useState<EvaluatorInfo>({
    relationship: '',
    hierarchyLevel: ''
  });
  
  const [evaluatorEmail, setEvaluatorEmail] = useState('');
  const [hasExistingData, setHasExistingData] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  // Tranches d'âge de 5 ans à partir de 18 ans
  const ageRanges = [
    '18-22 ans',
    '23-27 ans', 
    '28-32 ans',
    '33-37 ans',
    '38-42 ans',
    '43-47 ans',
    '48-52 ans',
    '53-57 ans',
    '58-62 ans',
    '63-67 ans',
    '68+ ans'
  ];

  // Options de hiérarchie pour collaborateur
  const collaboratorLevels = ['N-1', 'N-2', 'N-3', 'N-4', 'N-5+'];
  
  // Options de hiérarchie pour manager
  const managerLevels = ['N+1', 'N+2', 'N+3', 'N+4', 'N+5+'];

  useEffect(() => {
    // Vérifier s'il y a des données existantes
    const existingData = localStorage.getItem('evaluation-data');
    if (existingData) {
      setHasExistingData(true);
    }

    // Pré-remplir les champs s'ils existent
    const existingEvaluationInfo = localStorage.getItem('evaluation-info');
    if (existingEvaluationInfo) {
      try {
        const parsedEvaluationInfo = JSON.parse(existingEvaluationInfo);
        setEvaluatedPerson(parsedEvaluationInfo.evaluatedPerson || {
          firstName: '',
          lastName: '',
          position: '',
          ageRange: ''
        });
        setEvaluator(parsedEvaluationInfo.evaluator || {
          relationship: '',
          hierarchyLevel: ''
        });
        setEvaluatorEmail(parsedEvaluationInfo.evaluatorEmail || '');
      } catch (error) {
        console.log('Erreur lors du chargement des informations d\'évaluation:', error);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      const evaluationInfo: EvaluationData = {
        evaluatedPerson,
        evaluator,
        evaluatorEmail
      };
      localStorage.setItem('evaluation-info', JSON.stringify(evaluationInfo));
      router.push('/questionnaire/1?mode=evaluation');
    }
  };

  const handleRestart = () => {
    localStorage.removeItem('evaluation-data');
    localStorage.removeItem('evaluation-info');
    setHasExistingData(false);
  };

  const handleResume = () => {
    if (isFormValid) {
      const evaluationInfo: EvaluationData = {
        evaluatedPerson,
        evaluator,
        evaluatorEmail
      };
      localStorage.setItem('evaluation-info', JSON.stringify(evaluationInfo));
      
      // Trouver la dernière section complétée
      const existingData = JSON.parse(localStorage.getItem('evaluation-data') || '{}');
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
      router.push(`/questionnaire/${nextSection}?mode=evaluation`);
    }
  };

  const handleRelationshipChange = (relationship: string) => {
    setEvaluator({
      relationship,
      hierarchyLevel: relationship === 'Collègue' ? '' : evaluator.hierarchyLevel
    });
  };

  const isFormValid = 
    evaluatedPerson.firstName.trim() && 
    evaluatedPerson.lastName.trim() && 
    evaluatedPerson.position.trim() && 
    evaluatedPerson.ageRange && 
    evaluator.relationship && 
    (evaluator.relationship === 'Collègue' || evaluator.hierarchyLevel) &&
    evaluatorEmail.trim() && 
    consentAccepted;

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="hero-section" style={{ padding: '1.5rem 2rem' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>

          <Logo 
            height="120px" 
            style={{ marginBottom: '0.5rem' }}
          />

          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.75rem', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            Évaluation
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '0.75rem', fontWeight: '600' }}>
            Questionnaire d'analyse du potentiel : évaluation d'un collaborateur
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
                Rapport envoyé
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
              Ce questionnaire d'évaluation présente <strong>72 questions</strong> faisant référence à des situations courantes de la vie professionnelle pour évaluer le potentiel d'un collaborateur.
            </p>
            <p style={{ marginBottom: '0', color: '#4b5563' }}>
              Répondez à chaque question en vous basant sur votre observation de la personne évaluée dans son contexte professionnel.
            </p>
          </div>

          {hasExistingData && (
            <div className="warning-text" style={{ marginBottom: '2rem' }}>
              <p><strong>Reprise détectée :</strong> Vous avez déjà commencé cette évaluation.</p>
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
            
            {/* Section Personne évaluée */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)', 
              border: '1px solid rgba(102, 126, 234, 0.2)', 
              padding: '1.5rem', 
              borderRadius: '15px',
              marginBottom: '2rem'
            }}>
              <h3 style={{ 
                fontSize: '1.2rem', 
                marginBottom: '1.5rem', 
                color: '#4b5563',
                fontWeight: '600'
              }}>
                Personne évaluée
              </h3>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="evaluatedFirstName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Prénom *
                </label>
                <input
                  type="text"
                  id="evaluatedFirstName"
                  value={evaluatedPerson.firstName}
                  onChange={(e) => setEvaluatedPerson(prev => ({ ...prev, firstName: e.target.value }))}
                  className="input-field"
                  required
                  placeholder="Prénom de la personne évaluée"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="evaluatedLastName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Nom *
                </label>
                <input
                  type="text"
                  id="evaluatedLastName"
                  value={evaluatedPerson.lastName}
                  onChange={(e) => setEvaluatedPerson(prev => ({ ...prev, lastName: e.target.value }))}
                  className="input-field"
                  required
                  placeholder="Nom de la personne évaluée"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="evaluatedPosition" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Poste actuel *
                </label>
                <input
                  type="text"
                  id="evaluatedPosition"
                  value={evaluatedPerson.position}
                  onChange={(e) => setEvaluatedPerson(prev => ({ ...prev, position: e.target.value }))}
                  className="input-field"
                  required
                  placeholder="Poste de la personne évaluée"
                />
              </div>

              <div style={{ marginBottom: '0' }}>
                <label htmlFor="evaluatedAge" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Tranche d'âge *
                </label>
                <select
                  id="evaluatedAge"
                  value={evaluatedPerson.ageRange}
                  onChange={(e) => setEvaluatedPerson(prev => ({ ...prev, ageRange: e.target.value }))}
                  className="input-field"
                  required
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Sélectionnez une tranche d'âge</option>
                  {ageRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section Évaluateur */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)', 
              border: '1px solid rgba(102, 126, 234, 0.2)', 
              padding: '1.5rem', 
              borderRadius: '15px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ 
                fontSize: '1.2rem', 
                marginBottom: '1.5rem', 
                color: '#4b5563',
                fontWeight: '600'
              }}>
                Ma position par rapport à la personne évaluée
              </h3>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {['Collaborateur/trice N-x', 'Collègue', 'Manager N+x'].map(option => (
                    <label key={option} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.95rem'
                    }}>
                      <input
                        type="radio"
                        name="relationship"
                        value={option}
                        checked={evaluator.relationship === option}
                        onChange={(e) => handleRelationshipChange(e.target.value)}
                        style={{ 
                          width: '18px', 
                          height: '18px', 
                          accentColor: '#667eea'
                        }}
                        required
                      />
                      <span style={{ fontWeight: '500' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Menu déroulant hiérarchique */}
              {(evaluator.relationship === 'Collaborateur/trice N-x' || evaluator.relationship === 'Manager N+x') && (
                <div style={{ marginBottom: '0' }}>
                  <label htmlFor="hierarchyLevel" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Niveau hiérarchique *
                  </label>
                  <select
                    id="hierarchyLevel"
                    value={evaluator.hierarchyLevel || ''}
                    onChange={(e) => setEvaluator(prev => ({ ...prev, hierarchyLevel: e.target.value }))}
                    className="input-field"
                    required
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Sélectionnez le niveau</option>
                    {(evaluator.relationship === 'Collaborateur/trice N-x' ? collaboratorLevels : managerLevels).map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Email de l'évaluateur */}
            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="evaluatorEmail" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Votre adresse e-mail *
              </label>
              <input
                type="email"
                id="evaluatorEmail"
                value={evaluatorEmail}
                onChange={(e) => setEvaluatorEmail(e.target.value)}
                className="input-field"
                required
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
                Confidentialité de votre évaluation
              </h3>
              <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4b5563', marginBottom: '1.5rem' }}>
                <p style={{ marginBottom: '1rem' }}>
                  Cette évaluation est collectée par notre cabinet pour générer un rapport d'analyse du potentiel. 
                  Supervisé par un expert, ce rapport sera envoyé sous 24 à 48 heures à l'adresse e-mail que vous indiquez 
                  et uniquement à cette adresse.
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
                  J'ai lu et compris la mention relative à la confidentialité de mon évaluation.
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className="primary-button" 
              style={{ width: '100%', marginTop: '1.5rem' }}
              disabled={!isFormValid}
            >
              {hasExistingData ? 'Reprendre l\'évaluation' : 'Commencer l\'évaluation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 