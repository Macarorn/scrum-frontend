import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi";
import { askCoordinatorAI } from "../services/ai.service";
import { getUserFromToken, isCoordinador } from "../services/auth.service";
import "./AIStudioChat.css";

const AIStudioChat = () => {
  const user = getUserFromToken();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "¡Hola! Soy tu asistente de IA. Puedo ayudarte a analizar tus proyectos, tareas y el diagrama de Gantt. ¿Qué te gustaría saber?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Ocultar si no es coordinador o administrador
  if (!user || (!isCoordinador() && user.rol_plataforma !== "admin" && user.rol !== "admin")) {
    return null;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const responseText = await askCoordinatorAI(userMessage);
      setMessages((prev) => [...prev, { role: "ai", content: responseText }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `**Error:** No se pudo obtener respuesta. ${error.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="aistudio-chat-container">
      {isOpen ? (
        <div className="aistudio-window">
          <div className="aistudio-header">
            <h3>
              <FiMessageSquare /> AI Studio (Coordinador)
            </h3>
            <button className="aistudio-close-btn" onClick={() => setIsOpen(false)} aria-label="Cerrar chat">
              <FiX size={20} />
            </button>
          </div>

          <div className="aistudio-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`aistudio-message ${msg.role}`}>
                {msg.role === "ai" ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            ))}
            {isLoading && (
              <div className="aistudio-loading">
                <div className="aistudio-typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="aistudio-input-area" onSubmit={handleSend}>
            <input
              type="text"
              className="aistudio-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="aistudio-send-btn"
              disabled={!inputValue.trim() || isLoading}
            >
              <FiSend size={18} />
            </button>
          </form>
        </div>
      ) : (
        <button className="aistudio-toggle-btn" onClick={() => setIsOpen(true)}>
          <FiMessageSquare size={20} />
          Asistente IA
        </button>
      )}
    </div>
  );
};

export default AIStudioChat;
