import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import Dashboard from './Dashboard';
import './index.css';

const Main = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return user ? <Dashboard /> : <LoginPage />;
};

function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}

export default App;

