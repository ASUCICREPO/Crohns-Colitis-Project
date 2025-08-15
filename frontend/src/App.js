import React from "react";
import theme from "./theme";
import { ThemeProvider } from "@mui/material/styles";
import { LanguageProvider} from "./utils/LanguageContext";
import LandingPage from "./components/LandingPage";
import { useCookies } from "react-cookie";
import { ALLOW_LANDING_PAGE } from "./utils/constants";
import { TranscriptProvider } from './utils/TranscriptContext';
import FloatingChatWidget from './components/FloatingChatWidget';

function App() {
  const [cookies] = useCookies(['language']);
  const languageSet = Boolean(cookies.language);

  return (
    <LanguageProvider>
      <TranscriptProvider>
        <ThemeProvider theme={theme}>
          {!languageSet && ALLOW_LANDING_PAGE ? <LandingPage /> : <FloatingChatWidget />}
        </ThemeProvider>
      </TranscriptProvider>
    </LanguageProvider>
  );
}

export default App;