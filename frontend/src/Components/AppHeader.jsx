"use client"

import { AppBar, Toolbar, Button, Box, Typography, useMediaQuery, IconButton } from "@mui/material"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import MenuIcon from "@mui/icons-material/Menu"
// Import Catholic symbol from Assets folder
import CatholicSymbol from "../Assets/catholic.svg"
import { PRIMARY_MAIN, CHAT_BODY_BACKGROUND, primary_50 } from "../utilities/constants"

function AppHeader({ showLeftNav, setLeftNav }) {
  const isSmallScreen = useMediaQuery("(max-width:600px)")

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: CHAT_BODY_BACKGROUND,
        height: isSmallScreen ? "4rem" : "5rem",
        boxShadow: "none",
        borderBottom: `1.5px solid ${primary_50}`,
      }}
    >
      <Toolbar
        sx={{
          height: "100%",
          padding: {
            xs: "0 0.5rem",
            sm: "0 1rem",
            md: "0 2rem",
            lg: "0 3rem",
          },
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* Left side with menu button (small screens) and logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isSmallScreen && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setLeftNav(true)}
              sx={{ color: PRIMARY_MAIN }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <img
            src={CatholicSymbol || "/placeholder.svg"}
            alt="Catholic Symbol"
            width={isSmallScreen ? "50" : "100"}
            height={isSmallScreen ? "40" : "70"}
          />
          <Typography
            variant={isSmallScreen ? "h5" : "h5"}
            sx={{
              fontWeight: "bold",
              color: PRIMARY_MAIN,
              fontSize: isSmallScreen ? "1rem" : "1.5rem",
              whiteSpace: "nowrap",
            }}
          >
            Catholic Charities USA
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default AppHeader
