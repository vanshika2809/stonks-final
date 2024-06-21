import React, { useState, useEffect, useRef } from "react";
import data from "@emoji-mart/data";

function Chat({ messages, setMessages, setIsChatOpen }) {
  const [message, setMessage] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [focusedEmojiIndex, setFocusedEmojiIndex] = useState(0);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [focusedTagIndex, setFocusedTagIndex] = useState(0);
  const [commandSuggestions, setCommandSuggestions] = useState([]);
  const [focusedCommandIndex, setFocusedCommandIndex] = useState(0);

  // Ref for the messages container
  const messagesEndRef = useRef(null);
  const tagSuggestionsRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect to scroll to the bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const commands = [
    { command: "/mute" },
    { command: "/ban" },
    { command: "/title"},
    { command: "/description" },
  ];

  // Unified navigation function
  const navigateSuggestions = (
    e,
    items,
    setFocusedIndex,
    focusedIndex,
    isVerticalOnly = false,
    suggestionRef
  ) => {
    e.preventDefault();
    let newIndex = focusedIndex;
    const itemsPerRow = isVerticalOnly ? 1 : 6;
    switch (e.key) {
      case "ArrowUp":
        newIndex -= itemsPerRow;
        break;
      case "ArrowDown":
        newIndex += itemsPerRow;
        break;
      case "ArrowLeft":
        if (!isVerticalOnly) newIndex -= 1;
        break;
      case "ArrowRight":
        if (!isVerticalOnly) newIndex += 1;
        break;
    }
    newIndex = (newIndex + items.length) % items.length;
    setFocusedIndex(newIndex);

    // Scroll into view logic
    if (suggestionRef && suggestionRef.current) {
      const focusedElement = suggestionRef.current.children[newIndex];
      if (focusedElement) {
        focusedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsChatOpen(false);
        setShowEmojis(false);
      } else if (
        showEmojis &&
        searchResults.length &&
        (e.key === "ArrowUp" ||
          e.key === "ArrowDown" ||
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight")
      ) {
        // Handle emoji navigation which uses all four arrow keys
        navigateSuggestions(
          e,
          searchResults,
          setFocusedEmojiIndex,
          focusedEmojiIndex
        );
        e.preventDefault();
      } else if (
        (tagSuggestions.length || commandSuggestions.length) &&
        (e.key === "ArrowUp" || e.key === "ArrowDown")
      ) {
        // Handle navigation for tags and commands which uses only up and down arrow keys
        if (tagSuggestions.length) {
          navigateSuggestions(
            e,
            tagSuggestions,
            setFocusedTagIndex,
            focusedTagIndex,
            true,
            tagSuggestionsRef
          );
        } else if (commandSuggestions.length) {
          navigateSuggestions(
            e,
            commandSuggestions,
            setFocusedCommandIndex,
            focusedCommandIndex,
            true
          );
        }
        e.preventDefault();
      } else if (e.key === "Enter") {
        if (showEmojis && searchResults.length) {
          addEmoji(searchResults[focusedEmojiIndex]);
          e.preventDefault(); // Prevent form submission
        } else if (tagSuggestions.length) {
          setMessage(`@${tagSuggestions[focusedTagIndex].username}`);
          setTagSuggestions([]); // Hide tag suggestions after selection
          e.preventDefault();
        } else if (commandSuggestions.length) {
          setMessage(commandSuggestions[focusedCommandIndex].command);
          setCommandSuggestions([]); // Hide command suggestions after selection
          e.preventDefault();
        } else {
          sendMessage(e); // Call sendMessage if no suggestion is active
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    setIsChatOpen,
    showEmojis,
    searchResults,
    focusedEmojiIndex,
    tagSuggestions,
    focusedTagIndex,
    commandSuggestions,
    focusedCommandIndex,
  ]);

  const sendMessage = (e) => {
    e.preventDefault(); // Prevents the form from submitting, which would cause the page to reload.

    // Trims the message and checks if there's any content.
    if (message.trim()) {
      setMessages([...messages, message]);
      setMessage("");
      setShowEmojis(false);
      setFocusedEmojiIndex(0);
      setTagSuggestions([]);
      setCommandSuggestions([]);
    }
  };

  const getNativeEmoji = (emoji) => {
    return emoji.skins && emoji.skins.length > 0 && emoji.skins[0].native
      ? emoji.skins[0].native
      : "🚦";
  };

  const addEmoji = (emoji) => {
    const newText = message.replace(/:[a-zA-Z0-9_]+$/, getNativeEmoji(emoji));
    setMessage(newText);
    setShowEmojis(false);
    setSearchResults([]);
    setFocusedEmojiIndex(0);
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setMessage(text);
    handleEmojiSuggestions(text);
    handleTagSuggestions(text);
    handleCommandSuggestions(text);
  };

  const handleTagSuggestions = (text) => {
    const lastAtPos = text.lastIndexOf("@");
    if (lastAtPos !== -1) {
      const query = text.substring(lastAtPos + 1).toLowerCase();
      if (query.length > 0) {
        fetch(`https://665621609f970b3b36c4625e.mockapi.io/users?limit=100`)
          .then((res) => res.json())
          .then((data) => {
            const fuzzyMatch = (user, query) => {
              let score = 0;
              let tokenIndex = 0;
              let queryIndex = 0;
              const name = user.username.toLowerCase();

              while (queryIndex < query.length && tokenIndex < name.length) {
                if (name[tokenIndex] === query[queryIndex]) {
                  score++;
                  queryIndex++;
                }
                tokenIndex++;
              }
              return score / query.length; // Returning match percentage
            };

            const filteredUsers = data.filter(
              (user) => fuzzyMatch(user, query) > 0.6
            ); // Adjust the threshold as needed
            setTagSuggestions(
              Array.isArray(filteredUsers) ? filteredUsers : []
            );
          })
          .catch((err) => {
            console.error("Fetch error:", err);
            setTagSuggestions([]); // Ensure array even in case of error
          });
      } else {
        // If there's just an '@' with no text following, fetch the top 5 users
        fetch("https://665621609f970b3b36c4625e.mockapi.io/users?limit=5")
          .then((res) => res.json())
          .then((data) => {
            setTagSuggestions(Array.isArray(data) ? data : []);
          })
          .catch((err) => {
            console.error("Fetch error:", err);
            setTagSuggestions([]); // Ensure array even in case of error
          });
      }
    } else {
      setTagSuggestions([]);
    }
  };

  const handleCommandSuggestions = (text) => {
    const commandRegex = /^\/(\w*)$/;
    const match = text.match(commandRegex);
    if (match) {
      const searchTerm = match[1].toLowerCase();
      setCommandSuggestions(
        commands.filter((command) =>
          command.command.startsWith("/" + searchTerm)
        )
      );
    } else {
      setCommandSuggestions([]);
    }
  };

  const handleEmojiSuggestions = (text) => {
    const emojiRegex = /:([a-zA-Z0-9_]+)$/;
    const match = text.match(emojiRegex);
    if (match && match[1]) {
      const searchTerm = match[1].toLowerCase();
      const filteredEmojis = Object.values(data.emojis).filter(
        (emoji) =>
          emoji.name.toLowerCase().includes(searchTerm) ||
          (emoji.keywords &&
            emoji.keywords.some((keyword) =>
              keyword.toLowerCase().includes(searchTerm)
            ))
      );
      setSearchResults(filteredEmojis);
      setShowEmojis(true);
      setFocusedEmojiIndex(0);
    } else {
      setSearchResults([]);
      setShowEmojis(false);
    }
  };

  return (
    <div className="chat-container w-full h-full flex flex-col relative">
      <style>
        {`
          .emoji-search-results {
            position: absolute;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
            padding: 5px;
            background-color: #FCE4EC; /* Light pink background */
            border: 1px solid #f48fb1; /* Pink border */
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 300px;
            z-index: 1000;
            overflow-y: auto;
            max-height: 150px;
          }
          .emoji-btn {
            padding: 5px;
            font-size: 24px;
            background: none;
            border: none;
            cursor: pointer;
            outline: none;
          }
          .emoji-btn:hover {
            background-color: #f8bbd0; /* Lighter pink hover */
          }
          .tag-suggestions,
          .command-suggestions {
            max-height: 150px;
            overflow-y: auto;
            background-color: #FCE4EC; /* Light pink background */
            border: 1px solid #f48fb1; /* Pink border */
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
          }
          .suggestion,
          .command-item {
            padding: 8px;
            cursor: pointer;
          }
          .suggestion:hover,
          .command-item:hover {
            background-color: #f8bbd0; /* Lighter pink hover */
          }
          .emoji-btn.focused {
            background-color: #f8bbd0; /* Lighter pink focus */
          }
          .emoji-btn:focus,
          .suggestion:focus,
          .command-item:focus,
          .focused {
            background-color: #f8bbd0; /* Lighter pink focus */
          }
          .messages-container {
            background-color: #fff;
            border: 1px solid #f48fb1; /* Pink border */
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .message {
            padding: 8px;
            border-radius: 8px;
            margin-bottom: 8px;
          }
          .message.sender {
            background-color: #fce4ec; /* Light pink message background */
          }
          .message.receiver {
            background-color: #fff; /* White message background */
          }
          .message .font-bold {
            color: #f48fb1; /* Pink username */
          }
          .message .message-text {
            color: #333; /* Dark message text */
          }
          .input-container {
            position: relative;
          }
          .input-container input {
            flex: 1;
            padding: 12px;
            border: 1px solid #f48fb1; /* Pink border */
            border-radius: 8px;
            outline: none;
            font-size: 16px;
          }
          .input-container button {
            padding: 12px 24px;
            background-color: #f48fb1; /* Pink button background */
            color: #fff; /* White button text */
            border: none;
            border-radius: 8px;
            cursor: pointer;
            outline: none;
            transition: background-color 0.3s ease;
          }
          .input-container button:hover {
            background-color: #ec407a; /* Lighter pink hover */
          }
        `}
      </style>
      <div className="messages-container overflow-y-auto flex-1 bg-white border border-gray-300 rounded-lg p-4 mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message mb-2 last:mb-0 p-2 rounded ${
              msg.includes("@Vanshika2809") ? "receiver" : "sender"
            }`}
          >
            <div className="font-bold">@Vanshika2809</div>
            <div className="message-text">{msg}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="input-container flex gap-2 relative">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={handleInputChange}
          className="flex-1 px-4 py-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors duration-300"
        >
          Send
        </button>
        {showEmojis && searchResults.length > 0 && (
          <div className="emoji-search-results bottom-full mb-2 w-full">
            {searchResults.map((emoji, index) => (
              <button
                key={index}
                onClick={() => addEmoji(emoji)}
                className={`emoji-btn ${index === focusedEmojiIndex ? "focused" : ""}`}
              >
                {getNativeEmoji(emoji)}
              </button>
            ))}
          </div>
        )}
        {tagSuggestions.length > 0 && (
          <div
            className="tag-suggestions absolute bottom-full mb-2 w-full overflow-auto"
            ref={tagSuggestionsRef}
          >
            {tagSuggestions.map((user, index) => (
              <div
                key={user.id}
                onClick={() => setMessage(`@${user.username}`)}
                className={`command-item py-1 px-2 hover:bg-pink-100 cursor-pointer ${
                  index === focusedTagIndex ? "focused" : ""
                }`}
              >
                @{user.username}
              </div>
            ))}
          </div>
        )}
        {commandSuggestions.length > 0 && (
          <div className="command-suggestions absolute bottom-full mb-2 w-full">
            {commandSuggestions.map((item, index) => (
              <div
                key={index}
                onClick={() => setMessage(item.command)}
                className={`command-item py-1 px-2 hover:bg-pink-100 cursor-pointer ${
                  index === focusedCommandIndex ? "focused" : ""
                }`}
              >
                {item.command}
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}

export default Chat;
