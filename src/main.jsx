import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { logger } from "./utils/logger.js";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error("❌ Erro capturado:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(to bottom right, #fef2f2, white, #fff7ed)",
            padding: "20px",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "600px" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>💥</div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#dc2626",
                marginBottom: "16px",
              }}
            >
              Algo deu errado!
            </h1>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              {this.state.error?.message || "Erro desconhecido"}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 24px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Logs de debug
logger.info("🎯 main.jsx carregado");
logger.info("🌍 Environment:", import.meta.env.MODE);
logger.info("📦 Base URL:", import.meta.env.BASE_URL);
logger.info(
  "🔐 Supabase URL:",
  import.meta.env.VITE_SUPABASE_URL || "❌ NÃO CONFIGURADO",
);

// Verificar se root element existe
const rootElement = document.getElementById("root");
if (!rootElement) {
  logger.error("❌ Elemento root não encontrado!");
  document.body.innerHTML =
    '<div style="padding: 20px; color: red;">Erro: Elemento root não encontrado</div>';
} else {
  logger.info("✅ Elemento root encontrado");

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
}
