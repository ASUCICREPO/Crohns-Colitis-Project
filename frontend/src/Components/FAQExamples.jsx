import React, { useState, useEffect } from "react";
import { TEXT } from "../utilities/constants";
import { useLanguage } from "../utilities/LanguageContext"; // Adjust the import path
import { Box, Button, Grid, FormControl, Select, MenuItem, useMediaQuery, useTheme } from "@mui/material";

const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const FAQExamples = ({ onPromptClick, showLeftNav = true }) => {
  const { currentLanguage } = useLanguage();
  const [faqs, setFaqs] = useState([]);
  const [selectedFaq, setSelectedFaq] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    // Shuffle FAQs on initial render and when left nav state changes
    const questionCount = showLeftNav ? 4 : 5;
    const shuffledFAQs = shuffleArray([...TEXT[currentLanguage].FAQS]).slice(0, questionCount);
    setFaqs(shuffledFAQs);
    setSelectedFaq(""); // Reset selection when FAQs change
  }, [currentLanguage, showLeftNav]);

  const handleDropdownChange = (event) => {
    const value = event.target.value;
    setSelectedFaq(value);
    if (value) {
      onPromptClick(value);
    }
  };

  // Dropdown for mobile view
  const renderDropdown = () => (
    <FormControl fullWidth sx={{ maxWidth: "90%", margin: "0 auto" }}>
      <Select
        value={selectedFaq}
        onChange={handleDropdownChange}
        displayEmpty
        sx={{
          backgroundColor: "#dbf6ff",
          '& .MuiSelect-select': {
            padding: "10px"
          }
        }}
      >
        <MenuItem value="" disabled>
          <em>Select a frequently asked question</em>
        </MenuItem>
        {faqs.map((prompt, index) => (
          <MenuItem key={index} value={prompt}>
            {prompt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  // Grid buttons for desktop view
  const renderButtons = () => (
    <Grid container spacing={1}>
      {faqs.map((prompt, index) => (
        <Grid item key={index} xs={showLeftNav ? 3 : 2.4}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onPromptClick(prompt)}
            sx={{
              width: "100%",
              textAlign: "left", 
              textTransform: "none",
              backgroundColor: "#dbf6ff",
              color: "black",
              border: "1px solid #ccc",
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
              textTransform: "capitalize", // Prevent text from being uppercase
            }}
          >
            {prompt}
          </Button>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={isMobile ? "20vh" : "60vh"}>
      {isMobile ? renderDropdown() : renderButtons()}
    </Box>
  );
};

export default FAQExamples;
