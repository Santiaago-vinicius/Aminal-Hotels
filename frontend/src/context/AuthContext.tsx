import { createContext, useReducer, useEffect, type ReactNode } from "react";
import axios from "axios";

// --- TIPOS ---
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Ações que o Reducer entende
type AuthAction = 
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' };

// --- ESTADO INICIAL ---
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

// --- REDUCER (A máquina de estado) ---
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
};

// --- CONTEXTO ---
interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// --- PROVIDER (O Componente Pai) ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Ao recarregar a página, tenta recuperar o usuário do LocalStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('animal_token');
    const storedUser = localStorage.getItem('animal_user');

    if (storedToken && storedUser) {
      dispatch({
        type: 'LOGIN',
        payload: { user: JSON.parse(storedUser), token: storedToken }
      });
    }
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      // Chama seu Backend na porta 3333
      const response = await axios.post('http://localhost:3333/login', {
        email,
        password: pass
      });

      const { tutor, token } = response.data;

      // Salva no LocalStorage (persistência)
      localStorage.setItem('animal_token', token);
      localStorage.setItem('animal_user', JSON.stringify(tutor));

      // Atualiza o Estado Global via Reducer
      dispatch({ type: 'LOGIN', payload: { user: tutor, token } });
      
    } catch (error) {
      alert("Erro ao logar! Verifique email e senha.");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('animal_token');
    localStorage.removeItem('animal_user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};