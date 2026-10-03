import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [phone] = useState("919999999999");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    axios
      .post("/api/whatsapp/simulator/reset", { phone })
      .catch((error) => {
        console.error("Failed to reset conversation:", error);
      });
  }, [phone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = message.trim();

    if (!text || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "/api/whatsapp/simulator/message",
        {
          phone,
          message: text,
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: response.data.reply,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-container">

        <header className="chat-header">
          <div className="brand-avatar">U</div>

          <div>
            <h2>UrbanNest Realty</h2>
            <span>Property Assistant</span>
          </div>

          <div className="online-dot"></div>
        </header>

        <div className="chat-body">

          <div className="date-label">TODAY</div>

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-row ${msg.sender}`}
            >
              <div className="message">
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row bot">
              <div className="message typing">
                typing...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />

          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
          >
            ➤
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;