"use client"
import { TEXT, PRIMARY_MAIN, primary_50 } from "../utilities/constants"
import { Box, Button, Grid } from "@mui/material"

const FAQExamples = ({ onPromptClick }) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Grid container spacing={2} justifyContent="center">
        {TEXT.FAQS.map((prompt, index) => (
          <Grid item key={index} xs={12} sm={6} md={3} lg={3}>
            <Button
              variant="outlined"
              onClick={() => onPromptClick(prompt)}
              sx={{
                width: "100%",
                textAlign: "left",
                textTransform: "none",
                borderRadius: "2rem",
                padding: "0.75rem 1rem",
                backgroundColor: primary_50,
                color: PRIMARY_MAIN,
                border: "none",
                fontSize: "0.875rem",
                whiteSpace: "normal",
                height: "100%",
                "&:hover": {
                  backgroundColor: "#D1C9E1",
                  border: "none",
                },
              }}
            >
              {prompt}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default FAQExamples
