import ReactDOM from 'react-dom/client';
import { EventType, PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import App from './App';
import { msalConfig } from './authConfig';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.addEventCallback((event) => {
  if (
    event.eventType === EventType.LOGIN_SUCCESS &&
    event.payload &&
    'account' in event.payload &&
    event.payload.account
  ) {
    msalInstance.setActiveAccount(event.payload.account);
  }
});

async function bootstrap() {
  await msalInstance.initialize();
  const redirectResult = await msalInstance.handleRedirectPromise();

  if (redirectResult?.account) {
    msalInstance.setActiveAccount(redirectResult.account);
  } else {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      msalInstance.setActiveAccount(accounts[0]);
    }
  }

  const root = ReactDOM.createRoot(document.getElementById('root')!);
  root.render(
    <MsalProvider instance={msalInstance}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </MsalProvider>,
  );
}

bootstrap().catch((error) => {
  console.error('MSAL initialization failed:', error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML =
      '<div style="padding:2rem;font-family:sans-serif;color:#b00020">Failed to initialize Microsoft sign-in.</div>';
  }
});
