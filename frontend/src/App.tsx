import { Profile } from "./pages/Profile";
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext, type ReactNode } from "react";
import { AuthContext } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";

// --- SEGURANÇA DE ROTA (Rota Privada) ---
// Se não estiver logado, manda pro Login. Se estiver, mostra a página.
function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/" />;
}

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rota Privada (Protegida) */}
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
}

export default App;