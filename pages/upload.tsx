import { useState } from 'react';
import { useRouter } from 'next/router';
import Logo from '../components/Logo';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Vérifier que c'est un fichier Excel
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Veuillez sélectionner un fichier Excel (.xlsx)');
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Convertir le fichier en base64
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Extraire seulement la partie base64
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Envoyer le fichier à l'API
      const response = await fetch('/api/process-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileData: fileData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du traitement du fichier');
      }

      const result = await response.json();
      setMessage(result.message || 'Fichier traité avec succès. Le rapport sera envoyé par email dans quelques minutes.');
      
      // Réinitialiser le formulaire
      setFile(null);
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du traitement du fichier');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Logo />
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: '#1f2937'
            }}>
              Traitement d'un fichier Excel
            </h1>
            <p style={{ 
              fontSize: '1.1rem', 
              color: '#6b7280',
              marginBottom: '2rem'
            }}>
              Uploadez un fichier Excel généré par le questionnaire pour créer le rapport d'analyse
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label 
                htmlFor="file-input" 
                style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#374151'
                }}
              >
                Fichier Excel <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="file-input"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: '#ffffff',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <p style={{ 
                fontSize: '0.875rem', 
                color: '#6b7280', 
                marginTop: '0.25rem' 
              }}>
                Formats acceptés : .xlsx uniquement
              </p>
            </div>

            {file && (
              <div style={{ 
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '0.5rem'
              }}>
                <p style={{ margin: 0, color: '#0369a1' }}>
                  <strong>Fichier sélectionné :</strong> {file.name}
                </p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#0369a1' }}>
                  Taille : {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}

            <div style={{ 
              backgroundColor: '#fffbeb',
              border: '1px solid #f59e0b',
              borderRadius: '0.5rem',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ 
                margin: '0 0 0.5rem 0',
                color: '#92400e',
                fontSize: '1rem'
              }}>
                ℹ️ Information importante
              </h3>
              <p style={{ 
                margin: 0,
                color: '#92400e',
                fontSize: '0.875rem'
              }}>
                Cette fonctionnalité traite uniquement les fichiers Excel générés par ce système de questionnaire. 
                Le fichier doit contenir les informations utilisateur et les réponses dans le format exact généré par l'application.
              </p>
            </div>

            {error && (
              <div style={{ 
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #f87171',
                borderRadius: '0.5rem'
              }}>
                <p style={{ margin: 0, color: '#dc2626' }}>
                  ❌ {error}
                </p>
              </div>
            )}

            {message && (
              <div style={{ 
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #22c55e',
                borderRadius: '0.5rem'
              }}>
                <p style={{ margin: 0, color: '#16a34a' }}>
                  ✅ {message}
                </p>
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button
                type="button"
                onClick={handleBackToHome}
                className="secondary-button"
                style={{ flex: 1 }}
              >
                ← Retour à l'accueil
              </button>
              
              <button
                type="submit"
                disabled={!file || loading}
                className="primary-button"
                style={{ 
                  flex: 2,
                  opacity: (!file || loading) ? 0.6 : 1,
                  cursor: (!file || loading) ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Traitement en cours...' : 'Traiter le fichier'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 