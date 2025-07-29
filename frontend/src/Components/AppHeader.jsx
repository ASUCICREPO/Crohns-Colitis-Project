import React from "react";
import { Grid, AppBar } from "@mui/material";
import Logo from "../Assets/crohns-colitis-logo-header.png";
import Switch from "./Switch.jsx";
import { ALLOW_MULTLINGUAL_TOGGLE } from "../utilities/constants";

function AppHeader({ showSwitch }) {

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: (theme) => theme.palette.background.header,
        height: { xs: "4rem", sm: "5rem" },
        boxShadow: "none",
        borderBottom: (theme) => `1.5px solid ${theme.palette.primary[50]}`,
      }}
    >
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ padding: { xs: "0 1rem", sm: "0 1.5rem", md: "0 3rem" } }}
        className="appHeight100"
      >
        <Grid item>
          <img src={Logo} alt={`App main Logo`} style={{ height: 'auto', maxHeight: '64px', maxWidth: '100%' }} />
        </Grid>
        <Grid item>
          <Grid container alignItems="center" justifyContent="space-evenly" spacing={2}>
            <Grid item sx={{ display: ALLOW_MULTLINGUAL_TOGGLE && showSwitch ? "flex" : "none" }}>
              <Switch />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </AppBar>
  );
}

export default AppHeader;
