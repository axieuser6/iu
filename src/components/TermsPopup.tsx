import React, { useState, useCallback } from 'react';
import { Shield, FileText, Mic, User, Mail, Calendar } from 'lucide-react';

interface TermsPopupProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const TermsPopup: React.FC<TermsPopupProps> = ({ 
  isOpen, 
  onAccept, 
  onDecline 
}) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isScrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10;
    if (isScrolledToBottom && !hasScrolled) {
      setHasScrolled(true);
    }
  }, [hasScrolled]);

  const handleAccept = useCallback(async () => {
    setIsAccepting(true);
    
    // Store consent in localStorage with timestamp
    const consentData = {
      accepted: true,
      timestamp: new Date().toISOString(),
      version: '1.0',
      ip: 'user-ip', // Would be populated by backend in production
      userAgent: navigator.userAgent
    };
    
    localStorage.setItem('axie_studio_terms_consent', JSON.stringify(consentData));
    
    // Small delay for better UX
    setTimeout(() => {
      onAccept();
      setIsAccepting(false);
    }, 500);
  }, [onAccept]);

  const handleDecline = useCallback(() => {
    // Clear any existing consent
    localStorage.removeItem('axie_studio_terms_consent');
    onDecline();
  }, [onDecline]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-auto border border-gray-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-black">
                Villkor och Integritetspolicy
              </h2>
              <p className="text-sm text-gray-600">
                Axie Studio AI Röstassistent
              </p>
            </div>
          </div>
          <img 
            src="https://www.axiestudio.se/logo.jpg" 
            alt="Axie Studio" 
            className="w-8 h-8 rounded-lg object-cover"
          />
        </div>

        {/* Content */}
        <div 
          className="p-6 overflow-y-auto flex-1"
          onScroll={handleScroll}
        >
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            {/* Data Collection Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FileText size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Viktig Information om Datainsamling
                  </h3>
                  <p className="text-blue-800">
                    Genom att använda Axie Studio AI Röstassistent samtycker du till att vi samlar in och behandlar följande personuppgifter:
                  </p>
                </div>
              </div>
            </div>

            {/* Data Types */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <User size={16} className="text-gray-600" />
                  <span className="font-medium text-gray-900">Namn</span>
                </div>
                <p className="text-xs text-gray-600">
                  För- och efternamn för identifiering och personalisering av tjänsten.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail size={16} className="text-gray-600" />
                  <span className="font-medium text-gray-900">E-post</span>
                </div>
                <p className="text-xs text-gray-600">
                  E-postadress för kommunikation och uppföljning av tjänster.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar size={16} className="text-gray-600" />
                  <span className="font-medium text-gray-900">Bokningsinfo</span>
                </div>
                <p className="text-xs text-gray-600">
                  Bokningsdetaljer och preferenser för att tillhandahålla våra tjänster.
                </p>
              </div>
            </div>

            {/* Recording Notice */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Mic size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">
                    Inspelning av Röstsamtal
                  </h3>
                  <p className="text-red-800 mb-2">
                    <strong>VIKTIGT:</strong> Alla röstsamtal med Axie Studio AI Röstassistent spelas in för:
                  </p>
                  <ul className="list-disc list-inside text-red-800 space-y-1 text-xs">
                    <li>Kvalitetssäkring och förbättring av tjänsten</li>
                    <li>Utbildning av AI-modeller</li>
                    <li>Säkerhet och övervakning</li>
                    <li>Efterlevnad av juridiska krav</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Terms Content */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">1. Användning av Tjänsten</h3>
              <p>
                Genom att använda Axie Studio AI Röstassistent accepterar du dessa villkor och samtycker till behandling av dina personuppgifter enligt GDPR och svensk dataskyddslagstiftning.
              </p>

              <h3 className="font-semibold text-gray-900">2. Dataskydd och Integritet</h3>
              <p>
                Vi behandlar dina personuppgifter i enlighet med GDPR. Dina uppgifter används endast för att tillhandahålla och förbättra våra tjänster. Vi delar inte dina uppgifter med tredje part utan ditt samtycke.
              </p>

              <h3 className="font-semibold text-gray-900">3. Inspelning och Lagring</h3>
              <p>
                Röstsamtal spelas in och lagras säkert. Inspelningar kan användas för kvalitetssäkring, AI-träning och juridisk efterlevnad. Du har rätt att begära radering av dina inspelningar.
              </p>

              <h3 className="font-semibold text-gray-900">4. Dina Rättigheter</h3>
              <p>
                Du har rätt att få tillgång till, rätta, radera eller begränsa behandlingen av dina personuppgifter. Du kan också återkalla ditt samtycke när som helst.
              </p>

              <h3 className="font-semibold text-gray-900">5. Säkerhet</h3>
              <p>
                Vi använder branschstandarder för säkerhet för att skydda dina uppgifter. All kommunikation är krypterad och säker.
              </p>

              <h3 className="font-semibold text-gray-900">6. Kontakt</h3>
              <p>
                För frågor om dataskydd eller för att utöva dina rättigheter, kontakta oss via vår webbplats: 
                <a href="https://www.axiestudio.se" className="text-blue-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                  www.axiestudio.se
                </a>
              </p>

              <div className="bg-gray-100 rounded-lg p-4 mt-6">
                <p className="text-xs text-gray-600">
                  <strong>Senast uppdaterad:</strong> {new Date().toLocaleDateString('sv-SE')}<br />
                  <strong>Version:</strong> 1.0<br />
                  <strong>Ansvarig:</strong> Axie Studio AB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex-shrink-0">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleDecline}
              disabled={isAccepting}
              className="flex-1 px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              Avböj och Avsluta
            </button>
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className="flex-1 px-6 py-3 bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              {isAccepting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Accepterar...
                </>
              ) : (
                'Acceptera och Fortsätt'
              )}
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-3 text-center">
            Genom att klicka "Acceptera och Fortsätt" samtycker du till våra villkor och att ditt röstsamtal spelas in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPopup;