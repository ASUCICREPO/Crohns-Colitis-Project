import { Grid, Avatar, Typography } from "@mui/material"
// Import User Avatar from Assets folder
import UserAvatar from "../Assets/UserAvatar.svg"

function UserReply({ message }) {
  return (
    <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end" sx={{ marginTop: "1.5rem" }}>
      <Grid
        item
        className="userMessage"
        sx={{
          backgroundColor: "#E7E3F0",
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
      <Grid item>
        <Avatar alt="User Avatar" src={UserAvatar} sx={{ width: 40, height: 40 }} />
      </Grid>
    </Grid>
  )
}

export default UserReply
