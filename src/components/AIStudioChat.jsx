import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { FiMessageSquare, FiSend, FiMinus, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { askCoordinatorAI } from "../services/ai.service";
import { getUserFromToken, isCoordinador } from "../services/auth.service";
import "./AIStudioChat.css";

const AIStudioChat = () => {
  const user = getUserFromToken();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem("ai_chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error al cargar historial del chat:", e);
      }
    }
    return [
      {
        role: "ai",
        content:
          "¡Bienvenido, Coordinador del SENA! Soy su asistente de Inteligencia Artificial para la gestión de proyectos. Estoy a su entera disposición para analizar el progreso de los proyectos, tareas y métricas. ¿En qué le puedo asistir el día de hoy?",
      },
    ];
  });
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
      setTimeout(scrollToBottom, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    sessionStorage.setItem("ai_chat_history", JSON.stringify(messages));
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setTimeout(scrollToBottom, 50);

    try {
      // Pasamos los mensajes actuales como historial (no incluye el userMessage actual aún)
      const responseText = await askCoordinatorAI(userMessage, messages);
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
        <div className={`aistudio-window ${isFullScreen ? "fullscreen" : ""}`}>
          <div className="aistudio-header">
            <h3>
              <FiMessageSquare /> AI Studio (Coordinador)
            </h3>
            <div className="aistudio-header-actions">
              <button 
                className="aistudio-icon-btn" 
                onClick={() => setIsFullScreen(!isFullScreen)} 
                aria-label={isFullScreen ? "Restaurar tamaño" : "Pantalla completa"}
                title={isFullScreen ? "Restaurar tamaño" : "Pantalla completa"}
              >
                {isFullScreen ? <FiMinimize2 size={18} /> : <FiMaximize2 size={18} />}
              </button>
              <button 
                className="aistudio-icon-btn" 
                onClick={() => setIsOpen(false)} 
                aria-label="Minimizar chat"
                title="Minimizar"
              >
                <FiMinus size={20} />
              </button>
            </div>
          </div>

          <div className="aistudio-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`aistudio-message ${msg.role}`}>
                {msg.role === "ai" ? (
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>{msg.content}</ReactMarkdown>
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
