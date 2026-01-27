import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
    const { login, register } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const action = isLogin ? login : register;
        const result = await action(username, password);

        if (!result.success) {
            setError(result.error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <p>{isLogin ? 'Login to access your portfolio' : 'Sign up to start tracking your goals'}</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-btn">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <div className="toggle-auth">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setIsLogin(!isLogin)} className="link-btn">
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
