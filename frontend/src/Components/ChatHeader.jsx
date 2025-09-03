import Typography from "@mui/material/Typography"
import { TEXT } from "../utils/constants"
import { Box, Container, useMediaQuery } from "@mui/material"

function ChatHeader() {
  const isSmallScreen = useMediaQuery("(max-width:600px)")

  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "auto",
        padding: "0 !important",
        marginTop: "0.5rem",
        marginBottom: isSmallScreen ? "1rem" : "1.5rem",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: isSmallScreen ? 1 : 2,
        }}
      >
        <Typography
          variant={isSmallScreen ? "h5" : "h4"}
          className="chatHeaderText"
          sx={{
            color: "#001A70",
            fontWeight: "bold",
            fontSize: isSmallScreen ? "1.25rem" : "2rem",
            textAlign: "center",
          }}
        >
          {TEXT.CHAT_HEADER_TITLE}
        </Typography>
      </Box>
    </Container>
  )
}

export default ChatHeader
