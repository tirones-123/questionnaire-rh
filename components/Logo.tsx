import { useState, useEffect } from 'react';

interface LogoProps {
  height?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Logo({ height = '60px', className = '', style = {} }: LogoProps) {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Liste des formats de logo à tester dans l'ordre de préférence
    const logoFormats = [
      '/images/logo.svg',
      '/images/logo.png', 
      '/images/logo.jpg',
      '/images/logo.webp'
    ];

    // Fonction pour tester si une image existe
    const testImage = (src: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
      });
    };

    // Tester chaque format jusqu'à en trouver un qui existe
    const findLogo = async () => {
      for (const src of logoFormats) {
        const exists = await testImage(src);
        if (exists) {
          setLogoSrc(src);
          setIsLoading(false);
          return;
        }
      }
      // Aucun logo trouvé
      setLogoSrc(null);
      setIsLoading(false);
    };

    findLogo();
  }, []);

  if (isLoading) {
    // Placeholder pendant le chargement
    return (
      <div 
        className={className}
        style={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          ...style 
        }}
      >
        {/* Vous pouvez personnaliser ce placeholder */}
        <div style={{ 
          width: '120px', 
          height: height, 
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Placeholder vide pour éviter le décalage */}
        </div>
      </div>
    );
  }

  if (!logoSrc) {
    // Aucun logo trouvé - ne rien afficher ou afficher un placeholder
    return null;
  }

  return (
    <div 
      className={className}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        ...style 
      }}
    >
      <img
        src={logoSrc}
        alt="Logo"
        style={{
          height,
          maxWidth: '200px',
          objectFit: 'contain'
        }}
      />
    </div>
  );
} 