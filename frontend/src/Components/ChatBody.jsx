"use client"

import { useState, useRef, useEffect } from "react"
import { Tooltip, Box, Typography, useMediaQuery, Link, Chip, Collapse } from "@mui/material"
import ChatInput from "./ChatInput"
import UserReply from "./UserReply"
import BotReply from "./BotReply"
import createMessageBlock from "../utilities/createMessageBlock"
import { ALLOW_FAQ, CHAT_BODY_BACKGROUND, PRIMARY_MAIN, CHAT_ENDPOINT } from "../utilities/constants"
import FAQExamples from "./FAQExamples"

function ChatBody() {
  const [messageList, setMessageList] = useState([])
  const [processing, setProcessing] = useState(false)
  const [questionAsked, setQuestionAsked] = useState(false)
  const messagesEndRef = useRef(null)
  const isSmallScreen = useMediaQuery("(max-width:600px)")

  useEffect(() => {
    scrollToBottom()
  }, [messageList])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSendMessage = async (message) => {
    setProcessing(true)
    const newMessageBlock = createMessageBlock(message, "USER", "TEXT", "SENT")
    setMessageList([...messageList, newMessageBlock])

    await getBotResponse(setMessageList, setProcessing, message)
    setQuestionAsked(true)
  }

  const handlePromptClick = (prompt) => {
    handleSendMessage(prompt)
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Empty state or messages area */}
      {messageList.length > 0 || !ALLOW_FAQ || questionAsked ? (
        // Chat messages area with proper scrolling
        <Box
          className="chatScrollContainer appScroll"
          sx={{
            flex: "1 1 auto",
            overflowY: "auto",
            scrollbarGutter: "stable",
            paddingBottom: "1rem",
            paddingTop: "0",
            display: "flex",
            flexDirection: "column",
            maxHeight: "calc(100% - 100px)",
          }}
        >
          {messageList.map((msg, index) => (
            <Box
              key={index}
              mb={3}
              sx={{
                marginTop: index > 0 && messageList[index - 1].sentBy !== msg.sentBy ? "1.5rem" : "0.75rem",
              }}
            >
              {msg.sentBy === "USER" ? (
                <UserReply message={msg.message} />
              ) : (
                <BotReplyWithSources message={msg.message} sources={msg.sources} />
              )}
            </Box>
          ))}

          {/* Show simple loading indicator when processing */}
          {processing && (
            <Box sx={{ marginLeft: isSmallScreen ? "1rem" : "3rem", marginBottom: "1rem" }}>
              <Typography variant="body2" sx={{ color: PRIMARY_MAIN, fontStyle: "italic" }}>
                Thinking...
              </Typography>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>
      ) : (
        // Empty state with FAQ section positioned higher
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: "1 1 auto",
            justifyContent: "center",
            paddingBottom: "2rem",
          }}
        >
          <Box
            sx={{
              width: "100%",
              padding: "1rem 0",
              marginBottom: "1rem",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                marginBottom: "1.5rem",
                color: PRIMARY_MAIN,
                fontSize: isSmallScreen ? "1rem" : "1.25rem",
              }}
            >
              Frequently Asked Questions
            </Typography>
            <FAQExamples onPromptClick={handlePromptClick} />
          </Box>
        </Box>
      )}

      {/* Chat input area with fixed position */}
      <Box
        sx={{
          width: "100%",
          backgroundColor: CHAT_BODY_BACKGROUND,
          padding: "0.5rem 0 1rem",
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          marginTop: "auto",
          boxShadow: "0px -2px 10px rgba(0,0,0,0.05)",
          borderTop: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <ChatInput onSendMessage={handleSendMessage} processing={processing} />
      </Box>
    </Box>
  )
}

// Enhanced BotReply component with actual URL display
function BotReplyWithSources({ message, sources = [] }) {
  const isSmallScreen = useMediaQuery("(max-width:600px)")
  const [showSources, setShowSources] = useState(false)

  return (
    <Box>
      {/* Render the bot reply */}
      <BotReply message={message} />

      {/* If there are sources, show the toggle */}
      {sources && sources.length > 0 && (
        <Box sx={{ marginTop: "0.5rem", marginLeft: isSmallScreen ? "1rem" : "3rem" }}>
          {/* Toggle text: click to expand/collapse */}
          <Typography
            variant="body2"
            onClick={() => setShowSources((prev) => !prev)}
            sx={{
              fontWeight: "bold",
              color: PRIMARY_MAIN,
              fontSize: isSmallScreen ? "0.8rem" : "0.875rem",
              cursor: "pointer",
              userSelect: "none",
              display: "inline-block",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {showSources ? `Hide Sources (${sources.length})` : `Show Sources (${sources.length})`}
          </Typography>

          {/* Expand/collapse block */}
          <Collapse in={showSources}>
            <Box sx={{ marginTop: "0.5rem" }}>
              {/* Only one section: chips showing domain; tooltip shows full URL */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {sources.map((url, index) => {
                  const domainLabel = url
                  const label = domainLabel

                  return (
                    <Tooltip key={index} title={url}>
                      <Chip
                        label={label}
                        component={Link}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        clickable
                        size="small"
                        sx={{
                          backgroundColor: PRIMARY_MAIN,
                          color: "white",
                          fontSize: isSmallScreen ? "0.7rem" : "0.75rem",
                          height: isSmallScreen ? "24px" : "28px",
                          whiteSpace: "nowrap",
                          "&:hover": {
                            backgroundColor: "#2a1659",
                          },
                        }}
                      />
                    </Tooltip>
                  )
                })}
              </Box>
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  )
}

export default ChatBody

// Stateless API integration function
const getBotResponse = async (setMessageList, setProcessing, message) => {
  try {
    const requestBody = {
      message: message,
    }

    console.log("Sending stateless request:", requestBody)

    const response = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("API Error:", errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("API Response:", data)

    if (data.success) {
      const botMessageBlock = createMessageBlock(data.message, "BOT", "TEXT", "RECEIVED")
      botMessageBlock.sources = data.sources || []
      setMessageList((prevList) => [...prevList, botMessageBlock])
    } else {
      throw new Error(data.error || "Failed to get response")
    }
  } catch (error) {
    console.error("Error getting bot response:", error)
    const errorMessageBlock = createMessageBlock(
      "Sorry, I'm having trouble responding right now. Please try again later.",
      "BOT",
      "TEXT",
      "RECEIVED",
    )
    setMessageList((prevList) => [...prevList, errorMessageBlock])
  } finally {
    setProcessing(false)
  }
}
