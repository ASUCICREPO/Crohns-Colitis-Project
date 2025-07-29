import React, { useEffect } from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useLanguage } from "../utilities/LanguageContext"; // Adjust the import path
import { ABOUT_US_HEADER_BACKGROUND, ABOUT_US_TEXT, FAQ_HEADER_BACKGROUND, FAQ_TEXT, TEXT } from "../utilities/constants"; // Adjust the import path
import closeIcon from "../Assets/close.svg"; // Assuming close.svg is an image
import arrowRightIcon from "../Assets/arrow_right.svg"; // Assuming arrow_right.svg is an image
import Box from "@mui/material/Box";

function LeftNav({ showLeftNav = true, setLeftNav }) {
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    // Dispatch event when left nav state changes
    const event = new CustomEvent('leftNavChange', { detail: showLeftNav });
    window.dispatchEvent(event);
  }, [showLeftNav]);

  return (
    <Grid className="appHeight100">
      <Grid container direction="column" justifyContent="space-between" alignItems="stretch" padding={4} spacing={2} sx={{ height: '100%' }}>
        {showLeftNav ? (
          <>
            <Grid item>
              <Grid container direction="column" spacing={2}>
                <Grid item container direction="column" justifyContent="flex-start" alignItems="flex-end">
                  <img
                    src={closeIcon}
                    alt="Close Panel"
                    onClick={() => setLeftNav(false)}
                  />
                </Grid>
                <Grid item>
                  <Typography variant="h6" sx={{fontWeight:"bold"}} color={ABOUT_US_HEADER_BACKGROUND}>{TEXT[currentLanguage].ABOUT_US_TITLE}</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="subtitle1" color={ABOUT_US_TEXT}>{TEXT[currentLanguage].ABOUT_US}</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6" sx={{fontWeight:"bold"}} color={FAQ_HEADER_BACKGROUND}>{TEXT[currentLanguage].FAQ_TITLE}</Typography>
                </Grid>
                <Grid item>
                  <ul>
                    {TEXT[currentLanguage].FAQS.map((question, index) => (
                      <li key={index}>
                        <Typography variant="subtitle1" color={FAQ_TEXT}>{question}</Typography>
                      </li>
                    ))}
                  </ul>
                </Grid>
              </Grid>
            </Grid>

            {/* Simplify Toggle Explanation - Now at the bottom
            <Grid item sx={{ mt: 'auto' }}>
              <Box sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                padding: 2, 
                borderRadius: 1,
                mt: 2 
              }}>
                <Typography variant="subtitle1" sx={{fontWeight:"bold"}} color={ABOUT_US_HEADER_BACKGROUND}>
                  {currentLanguage === 'ES' ? 'Modo Simplificado' : 'Simplify Mode'}
                </Typography>
                <Typography variant="body2" color={ABOUT_US_TEXT} sx={{ mt: 1 }}>
                  {currentLanguage === 'ES' 
                    ? 'Cuando está activado, el asistente proporciona respuestas más claras y fáciles de seguir para usuarios que desean explicaciones simples y directas.'
                    : 'When turned on, the assistant gives clearer, easier-to-follow answers for users who want simple, straightforward explanations.'}
                </Typography>
              </Box>
            </Grid> */}
          </>
        ) : (
          <>
            <Grid item container direction="column" justifyContent="flex-start" alignItems="flex-end">
              <img
                src={arrowRightIcon}
                alt="Open Panel"
                onClick={() => setLeftNav(true)}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Grid>
  );
}

export default LeftNav;
