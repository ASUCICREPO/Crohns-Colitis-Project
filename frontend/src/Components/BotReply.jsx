import { Grid, Avatar, Typography } from "@mui/material"
// Import Bot Avatar from Assets folder
import BotAvatar from "../Assets/catholic_bot1.svg"
import { BOTMESSAGE_BACKGROUND } from "../utilities/constants"

function BotReply({ message }) {
  return (
    <Grid container direction="row" justifyContent="flex-start" alignItems="flex-end">
      <Grid item>
        <Avatar alt="Bot Avatar" src={BotAvatar} sx={{ width: 40, height: 40 }} />
      </Grid>
      <Grid
        item
        className="botMessage"
        sx={{
          backgroundColor: BOTMESSAGE_BACKGROUND,
          maxWidth: "75%", // Ensure maximum width
          wordBreak: "break-word", // Break words to prevent overflow
          overflowWrap: "break-word", // Ensure words wrap properly
          whiteSpace: "pre-wrap", // Preserve whitespace but allow wrapping
        }}
      >
        <Typography
          variant="body2"
          sx={{
            wordBreak: "break-word",
            overflowWrap: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {message}
        </Typography>
      </Grid>
    </Grid>
  )
}

export default BotReply
