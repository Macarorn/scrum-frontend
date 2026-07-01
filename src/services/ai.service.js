import API_URL from "./api";

export const askCoordinatorAI = async (question) => {
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
    body: JSON.stringify({ question }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al procesar la solicitud con IA.");
  }

  return data.answer;
};
