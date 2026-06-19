import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { username, password });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify({
                    username: response.data.username,
                    role: response.data.role,
                    fullName: response.data.fullName
                }));
                window.location.href = '/dashboard';
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="glass-card animate-fade-in" style={{ padding: '40px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <div style={{ marginBottom: '30px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📚</div>
                    <h1 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Smart Attendance</h1>
                    <p style={{ color: '#64748b', margin: 0 }}>Admin & Staff Portal</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                            style={{
                                width: '100%', padding: '12px', borderRadius: '10px',
                                border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.8)',
                                outline: 'none', fontSize: '1rem', boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            style={{
                                width: '100%', padding: '12px', borderRadius: '10px',
                                border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.8)',
                                outline: 'none', fontSize: '1rem', boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626',
                            padding: '12px', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="glass-btn" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px' }}>Are you a student?</p>
                    <button
                        onClick={() => navigate('/student-login')}
                        style={{
                            background: 'transparent', border: '2px solid var(--primary)', color: 'var(--primary)',
                            padding: '10px 20px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer',
                            transition: 'all 0.3s', width: '100%'
                        }}
                        onMouseOver={(e) => e.target.style.background = 'rgba(37, 99, 235, 0.05)'}
                        onMouseOut={(e) => e.target.style.background = 'transparent'}
                    >
                        Student Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
