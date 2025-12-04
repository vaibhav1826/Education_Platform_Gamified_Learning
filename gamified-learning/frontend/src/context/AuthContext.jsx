import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth.js';

const AuthContext = createContext();

const initialState = { user: null, accessToken: localStorage.getItem('accessToken'), loading: true };

const reducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload.user, accessToken: action.payload.token, loading: false };
    case 'LOGOUT':
      return { ...initialState, accessToken: null, loading: false };
    case 'LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { initAuth, login, signup, loginWithGoogle, logout } = useAuth();

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      dispatch({ type: 'LOADING', payload: true });
      const data = await initAuth();
      if (mounted && data) dispatch({ type: 'LOGIN', payload: data });
      dispatch({ type: 'LOADING', payload: false });
    };
    bootstrap();
    return () => {
      mounted = false;
    };
  }, [initAuth]);

  const handleLogin = useCallback(async (payload) => {
    const data = await login(payload);
    if (data) dispatch({ type: 'LOGIN', payload: data });
  }, [login]);

  const handleSignup = useCallback(async (payload) => {
    const data = await signup(payload);
    if (data) dispatch({ type: 'LOGIN', payload: data });
  }, [signup]);

  const handleGoogle = useCallback(async (payload) => {
    const data = await loginWithGoogle(payload);
    if (data) dispatch({ type: 'LOGIN', payload: data });
  }, [loginWithGoogle]);

  const handleLogout = useCallback(async () => {
    await logout();
    dispatch({ type: 'LOGOUT' });
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{ ...state, login: handleLogin, signup: handleSignup, loginWithGoogle: handleGoogle, logout: handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);