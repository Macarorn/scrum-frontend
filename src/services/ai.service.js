import API_URL from "./api";

export const askCoordinatorAI = async (question, history = [], onChunk = null) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No estás autenticado.");
  }

  const response = await fetch(`${API_URL}/ai/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question, history }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al procesar la solicitud con IA.");
  }

  if (!onChunk) {
    const data = await response.json();
    return data.answer;
  }

  // Streaming
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let answer = "";
  let buffer = "";
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    
    // La última línea podría estar incompleta si se cortó el paquete de red
    buffer = lines.pop(); 
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
        try {
          const data = JSON.parse(trimmed.substring(6));
          if (data.error) {
            const errorMsg = (data.error.message || "").toLowerCase();
            if (errorMsg.includes("rate-limited") || errorMsg.includes("busy") || errorMsg.includes("overloaded")) {
              answer += `\n\n*(Nota: El asistente está recibiendo demasiadas peticiones en este momento y no pudo procesar tu mensaje. Por favor, inténtalo de nuevo en unos segundos).*`;
            } else {
              answer += `\n\n*(Hubo un problema de conexión con el servidor de inteligencia artificial. Inténtalo de nuevo).*`;
            }
            onChunk(answer);
          } else if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
            answer += data.choices[0].delta.content;
            onChunk(answer);
          }
        } catch (e) {
          // Ignorar errores de parseo intermedios
        }
      }
    }
  }

  return answer;
};
