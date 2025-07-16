import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Mic, User, Mail, Calendar } from 'lucide-react';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link 
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Tillbaka till AI-assistent</span>
            </Link>
            <div className="flex items-center space-x-3">
              <img 
                src="https://www.axiestudio.se/logo.jpg" 
                alt="Axie Studio" 
                className="w-8 h-8 rounded-lg object-cover"
              />
              <h1 className="text-xl font-semibold text-gray-900">Axie Studio</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Title */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">
                  Villkor och Integritetspolicy
                </h2>
                <p className="text-gray-600">
                  Axie Studio AI Röstassistent
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Data Collection Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <FileText size={24} className="text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    Viktig Information om Datainsamling
                  </h3>
                  <p className="text-blue-800 leading-relaxed">
                    Genom att använda Axie Studio AI Röstassistent samtycker du till att vi samlar in och behandlar följande personuppgifter:
                  </p>
                </div>
              </div>
            </div>

            {/* Data Types */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <User size={20} className="text-gray-600" />
                  <span className="font-semibold text-gray-900">Namn</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  För- och efternamn för identifiering och personalisering av tjänsten.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Mail size={20} className="text-gray-600" />
                  <span className="font-semibold text-gray-900">E-post</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  E-postadress för kommunikation och uppföljning av tjänster.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar size={20} className="text-gray-600" />
                  <span className="font-semibold text-gray-900">Bokningsinfo</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Bokningsdetaljer och preferenser för att tillhandahålla våra tjänster.
                </p>
              </div>
            </div>

            {/* Recording Notice */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <Mic size={24} className="text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-3">
                    Inspelning av Röstsamtal
                  </h3>
                  <p className="text-red-800 mb-3 leading-relaxed">
                    <strong>VIKTIGT:</strong> Alla röstsamtal med Axie Studio AI Röstassistent spelas in för:
                  </p>
                  <ul className="list-disc list-inside text-red-800 space-y-2 text-sm leading-relaxed">
                    <li>Kvalitetssäkring och förbättring av tjänsten</li>
                    <li>Utbildning av AI-modeller</li>
                    <li>Säkerhet och övervakning</li>
                    <li>Efterlevnad av juridiska krav</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Terms Content */}
            <div className="prose prose-gray max-w-none">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Användning av Tjänsten</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Genom att använda Axie Studio AI Röstassistent accepterar du dessa villkor och samtycker till behandling av dina personuppgifter enligt GDPR och svensk dataskyddslagstiftning.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Dataskydd och Integritet</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Vi behandlar dina personuppgifter i enlighet med GDPR. Dina uppgifter används endast för att tillhandahålla och förbättra våra tjänster. Vi delar inte dina uppgifter med tredje part utan ditt samtycke.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Inspelning och Lagring</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Röstsamtal spelas in och lagras säkert. Inspelningar kan användas för kvalitetssäkring, AI-träning och juridisk efterlevnad. Du har rätt att begära radering av dina inspelningar.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Dina Rättigheter</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Du har rätt att få tillgång till, rätta, radera eller begränsa behandlingen av dina personuppgifter. Du kan också återkalla ditt samtycke när som helst.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">5. Säkerhet</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Vi använder branschstandarder för säkerhet för att skydda dina uppgifter. All kommunikation är krypterad och säker.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Kontakt</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                För frågor om dataskydd eller för att utöva dina rättigheter, kontakta oss via vår webbplats: 
                <a href="https://www.axiestudio.se" className="text-blue-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                  www.axiestudio.se
                </a>
              </p>

              <div className="bg-gray-100 rounded-lg p-6 mt-8">
                <p className="text-sm text-gray-600 leading-relaxed">
                  <strong>Senast uppdaterad:</strong> {new Date().toLocaleDateString('sv-SE')}<br />
                  <strong>Version:</strong> 1.0<br />
                  <strong>Ansvarig:</strong> Axie Studio AB
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;