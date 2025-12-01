import { createContext, useReducer, useEffect, type ReactNode } from "react";
import { api } from "../services/api.ts";

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

type AuthAction = 
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

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

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const storedToken = localStorage.getItem('animal_token');
    const storedUser = localStorage.getItem('animal_user');

    if (storedToken && storedUser) {
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      dispatch({
        type: 'LOGIN',
        payload: { user: JSON.parse(storedUser), token: storedToken }
      });
    }
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const response = await api.post('/login', { email, password: pass });
      const { tutor, token } = response.data;

      localStorage.setItem('animal_token', token);
      localStorage.setItem('animal_user', JSON.stringify(tutor));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch({ type: 'LOGIN', payload: { user: tutor, token } });
    } catch (error) {
      alert("Erro ao logar! Verifique email e senha.");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('animal_token');
    localStorage.removeItem('animal_user');
    delete api.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};