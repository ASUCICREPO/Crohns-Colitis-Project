"use client"

import { Box, Typography, List, ListItem, ListItemText, useMediaQuery, IconButton } from "@mui/material"
import { TEXT, ABOUT_US_TEXT, FAQ_TEXT, PRIMARY_MAIN } from "../utilities/constants"
// Material-UI icons
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import CloseIcon from "@mui/icons-material/Close"

function LeftNav({ showLeftNav, setLeftNav }) {
  const isSmallScreen = useMediaQuery("(max-width:600px)")

  return (
    <Box
      sx={{
        height: "100%",
        color: ABOUT_US_TEXT,
        padding: "2rem 1rem",
        position: "relative",
        overflow: "auto",
      }}
    >
      {/* Toggle button with conditional icon - only show on non-small screens */}
      {!isSmallScreen && (
        <IconButton
          sx={{
            position: "absolute",
            right: "5px",
            top: "10px",
            backgroundColor: PRIMARY_MAIN,
            color: ABOUT_US_TEXT,
            padding: "5px",
            "&:hover": {
              backgroundColor: "#2a1659",
            },
          }}
          onClick={() => setLeftNav(!showLeftNav)}
        >
          {showLeftNav ? <CloseIcon /> : <ChevronRightIcon />}
        </IconButton>
      )}

      {/* Close button for small screens */}
      {isSmallScreen && (
        <IconButton
          sx={{
            position: "absolute",
            right: "5px",
            top: "10px",
            backgroundColor: PRIMARY_MAIN,
            color: ABOUT_US_TEXT,
            padding: "5px",
            "&:hover": {
              backgroundColor: "#2a1659",
            },
          }}
          onClick={() => setLeftNav(false)}
        >
          <CloseIcon />
        </IconButton>
      )}

      {/* About Us Section */}
      {(showLeftNav || isSmallScreen) && (
        <>
          <Typography
            variant="h6"
            sx={{
              color: ABOUT_US_TEXT,
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            {TEXT.ABOUT_US_TITLE}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: ABOUT_US_TEXT,
              marginBottom: "2rem",
            }}
          >
            {TEXT.ABOUT_US}
          </Typography>

          {/* FAQs Section */}
          <Typography
            variant="h6"
            sx={{
              color: FAQ_TEXT,
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            {TEXT.FAQ_TITLE}
          </Typography>
          <List>
            {TEXT.FAQS.map((faq, index) => (
              <ListItem key={index} sx={{ padding: "0.25rem 0" }}>
                <ListItemText
                  primary={faq}
                  sx={{
                    color: FAQ_TEXT,
                    "& .MuiListItemText-primary": {
                      fontSize: "0.9rem",
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  )
}

export default LeftNav
