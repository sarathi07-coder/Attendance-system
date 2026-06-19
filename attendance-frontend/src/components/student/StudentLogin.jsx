import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const StudentLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/student/login', { email, password });

            if (response.data.success) {
                localStorage.setItem('studentToken', response.data.token);
                localStorage.setItem('student', JSON.stringify(response.data.student));
                navigate('/student-dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid email or password');
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
            <div className="glass-card animate-fade-in" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎓</div>
                    <h1 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Student Portal</h1>
                    <p style={{ color: '#64748b', margin: 0 }}>Login to view your attendance</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@school.com"
                            required
                            style={{
                                width: '100%', padding: '12px', borderRadius: '10px',
                                border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.8)',
                                outline: 'none', fontSize: '1rem', boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div>
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
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px' }}>Are you an admin?</p>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)',
                            padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem'
                        }}
                    >
                        Go to Admin Login
                    </button>
                </div>

                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '12px', fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: '600', color: 'var(--primary)', marginBottom: '5px' }}>Demo Credentials:</div>
                    <div style={{ color: '#64748b' }}>partha@school.com / partha123</div>
                    <div style={{ color: '#64748b' }}>ravi@school.com / ravi123</div>
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;
