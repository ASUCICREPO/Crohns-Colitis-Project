import React, { useState, useEffect } from "react";
import { TextField, Grid, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useLanguage } from "../utils/LanguageContext";
import { getTranslation } from "../utils/translations";
import { useTranscript } from "../utils/TranscriptContext";

function ChatInput({ onSendMessage, processing }) {
  const [message, setMessage] = useState("");
  const [helperText, setHelperText] = useState("");
  const { currentLanguage } = useLanguage();
  const { transcript, setTranscript, isListening } = useTranscript();

  useEffect(() => {
    if (!isListening && transcript) {
      setMessage(prevMessage => prevMessage ? `${prevMessage} ${transcript}` : transcript);
      setTranscript(""); // Clear the transcript buffer
    }
  }, [isListening, transcript, setTranscript]);

  const handleTyping = (event) => {
    if (helperText) {
      setHelperText("");
    }
    setMessage(event.target.value);
  };

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      onSendMessage(message);
      setMessage("");
    } else {
      setHelperText(getTranslation('helperText', currentLanguage));
    }
  };

  const getMessage = (message, transcript, isListening) => {
    if (isListening) {
      if (transcript.length) {
        return message.length ? `${message} ${transcript}` : transcript;
      }
    }
    return message;
  };

  return (
    <Grid container item xs={12} alignItems="center" className="sendMessageContainer">
      <Grid item xs={10} sm={11} md={11.5}>
        <TextField
          multiline
          maxRows={2}
          fullWidth
          disabled={isListening}
          placeholder={getTranslation('chatInputPlaceholder', currentLanguage)}
          id="USERCHATINPUT"
          value={getMessage(message, transcript, isListening)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !processing) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          onChange={handleTyping}
          helperText={isListening ? getTranslation('speechRecognitionHelperText', currentLanguage) : helperText}
          sx={{ 
            "& fieldset": { border: "none" },
            "& .MuiInputBase-root": {
              minHeight: "40px",
              padding: "8px 12px"
            },
            "& .MuiInputBase-input": {
              padding: "0",
              lineHeight: "1.2",
              fontSize: "0.875rem"
            }
          }}
        />
      </Grid>
      <Grid item xs={2} sm={1} md={0.5}>
        <IconButton
          aria-label="send"
          disabled={processing || isListening}
          onClick={handleSendMessage}
          color={message.trim() !== "" ? "primary" : "default"}
          sx={{ 
            padding: { xs: '8px', sm: '12px' },
            '& svg': { fontSize: { xs: '1.2rem', sm: '1.5rem' } }
          }}
        >
          <SendIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
}

export default ChatInput;
