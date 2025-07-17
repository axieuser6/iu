import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  sv: {
    translation: {
      // Form validation errors
      'error.email.required': 'E-post krävs',
      'error.email.invalid': 'Vänligen ange en giltig e-postadress',
      'error.firstName.required': 'Förnamn krävs',
      'error.lastName.required': 'Efternamn krävs',
      'error.terms.required': 'Du måste godkänna villkoren för att fortsätta',
      'error.network': 'Nätverksfel. Försök igen.',
      'error.submission.failed': 'Misslyckades att skicka. Försök igen.',
      
      // Form labels and buttons
      'form.firstName.placeholder': 'Förnamn',
      'form.lastName.placeholder': 'Efternamn',
      'form.email.placeholder': 'din@email.com',
      'button.cancel': 'Avbryt',
      'button.submit': 'Skicka',
      'button.continue': 'Fortsätt samtal',
      'button.startCall': 'Starta AI-samtal',
      
      // Status messages
      'status.submitting': 'Skickar...',
      'status.processing': 'Bearbetar samtal...',
      'status.starting': 'Startar samtal...',
      
      // Headers and titles
      'title.emailRequired': 'E-post krävs',
      'title.nameRequired': 'Namn krävs',
      'title.welcome': 'Välkommen till Axie Studio',
      'title.activeCall': 'Pågående Axie Studio samtal',
      
      // Descriptions
      'description.enterEmail': 'Ange din e-post för att slutföra bokning:',
      'description.enterName': 'Ange ditt namn för att fortsätta:',
      'description.fillInfo': 'Fyll i dina uppgifter för att starta samtalet med vår AI-assistent',
      'description.activeCallEmail': 'Du är för närvarande i ett aktivt Axie Studio samtal. Vänligen ange din e-post (Steg 2):',
      'description.activeCallName': 'Du är för närvarande i ett aktivt Axie Studio samtal. Vänligen ange ditt namn (Steg 1):',
      
      // Terms
      'terms.agreement': 'Genom att fortsätta godkänner du våra',
      'terms.link': 'villkor'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'sv',
    fallbackLng: 'sv',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;