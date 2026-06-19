import { useState, useEffect } from 'react';
import api from '../../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const StudentDashboard = () => {
    const [student, setStudent] = useState(null);
    const [qrData, setQrData] = useState(null);
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('home');

    useEffect(() => {
        const storedStudent = JSON.parse(localStorage.getItem('student') || 'null');
        if (storedStudent) {
            setStudent(storedStudent);
            fetchQRCode(storedStudent.id);
            fetchHistory(storedStudent.id);
        }
    }, []);

    const fetchQRCode = async (studentId) => {
        try {
            const res = await api.get(`/student/${studentId}/qrcode`);
            setQrData(res.data);
        } catch (error) {
            console.error('Error fetching QR:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (studentId) => {
        try {
            const res = await api.get(`/student/${studentId}/attendance-history?days=30`);
            setHistory(res.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('studentToken');
        localStorage.removeItem('student');
        window.location.href = '/student-login';
    };

    const formatSession = (session) => {
        const sessions = {
            'MORNING_1': 'Morning 1 (10:00 - 11:00)',
            'MORNING_2': 'Morning 2 (11:15 - 12:15)',
            'AFTERNOON_1': 'Afternoon 1 (1:00 - 2:00)',
            'AFTERNOON_2': 'Afternoon 2 (2:15 - 3:15)'
        };
        return sessions[session] || session;
    };

    if (!student) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <p>Please login to view your dashboard</p>
                    <a href="/student-login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Go to Login</a>
                </div>
            </div>
        );
    }

    const chartData = history ? [
        { name: 'Present', value: history.stats.present, color: '#10b981' },
        { name: 'Absent', value: history.stats.absent, color: '#ef4444' },
        { name: 'On Duty', value: history.stats.od, color: '#f59e0b' },
    ] : [];

    return (
        <div className="app-container" style={{ flexDirection: 'column', marginLeft: 0, width: '100%' }}>
            {/* Header */}
            <header style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                padding: '16px 40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '20px', fontWeight: '700', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                    }}>
                        {student.name.charAt(0)}
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#1e293b' }}>
                            {student.name}
                        </h1>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                            {student.rollNo} | {student.department}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="glass-btn"
                    style={{ background: 'white', color: '#ef4444', border: '1px solid #fee2e2' }}
                >
                    Logout
                </button>
            </header>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <div className="glass-panel" style={{ padding: '6px', borderRadius: '16px', display: 'flex', gap: '8px' }}>
                    {['home', 'history', 'stats'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                background: activeTab === tab ? 'var(--primary)' : 'transparent',
                                color: activeTab === tab ? 'white' : '#64748b',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab === 'home' ? '🏠 Home' : tab === 'history' ? '📋 History' : '📊 Stats'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <main style={{ padding: '20px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

                {/* HOME TAB - QR Code */}
                {activeTab === 'home' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                        <div className="glass-card animate-fade-in" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
                            <h2 style={{
                                fontSize: '1.5rem', fontWeight: '700', marginBottom: '10px',
                                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                            }}>
                                Your Attendance QR
                            </h2>
                            <p style={{ color: '#64748b', marginBottom: '30px' }}>Scan this code to mark your attendance</p>

                            {loading ? (
                                <div style={{ padding: '40px', color: 'var(--primary)' }}>Loading...</div>
                            ) : qrData?.inSession ? (
                                <>
                                    {qrData.alreadyCheckedIn ? (
                                        <div style={{
                                            padding: '30px', background: 'rgba(16, 185, 129, 0.1)',
                                            borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)'
                                        }}>
                                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
                                            <h3 style={{ color: '#059669', margin: '0 0 5px 0' }}>Checked In!</h3>
                                            <p style={{ color: '#64748b', margin: 0 }}>{new Date(qrData.checkinTime).toLocaleTimeString()}</p>
                                        </div>
                                    ) : (
                                        <div style={{ background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                            <QRCodeSVG value={qrData.qrToken} size={220} level="H" />
                                            <div style={{ marginTop: '15px', fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                                                {qrData.qrToken}
                                            </div>
                                        </div>
                                    )}
                                    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(37, 99, 235, 0.05)', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Current Session</div>
                                        <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{formatSession(qrData.currentSession)}</div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ padding: '40px', background: '#f8fafc', borderRadius: '20px' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>⏳</div>
                                    <h3 style={{ color: '#64748b' }}>No Active Session</h3>
                                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Check back during class hours</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* HISTORY TAB */}
                {activeTab === 'history' && history && (
                    <div className="animate-fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Attendance History</h2>
                            <button className="glass-btn" onClick={() => window.print()}>Download Report</button>
                        </div>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {Object.entries(history.history).map(([date, sessions]) => (
                                <div key={date} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                        {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {sessions.map((s, idx) => (
                                            <div key={idx} style={{
                                                padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500',
                                                background: s.checkedIn ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: s.checkedIn ? '#059669' : '#dc2626',
                                                display: 'flex', alignItems: 'center', gap: '6px'
                                            }}>
                                                <span>{s.checkedIn ? '✓' : '✗'}</span>
                                                {s.session.replace('_', ' ')}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* STATS TAB */}
                {activeTab === 'stats' && history && (
                    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                        <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h3 style={{ marginBottom: '20px' }}>Attendance Distribution</h3>
                            <div style={{ width: '100%', height: '300px' }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                            <h3 style={{ color: '#64748b' }}>Overall Attendance</h3>
                            <div style={{
                                fontSize: '5rem', fontWeight: '800', margin: '20px 0',
                                background: `linear-gradient(135deg, ${history.stats.attendancePercentage >= 75 ? '#10b981' : '#ef4444'} 0%, ${history.stats.attendancePercentage >= 75 ? '#059669' : '#dc2626'} 100%)`,
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                            }}>
                                {history.stats.attendancePercentage}%
                            </div>
                            <div style={{
                                padding: '10px 20px', borderRadius: '20px', display: 'inline-block', margin: '0 auto',
                                background: history.stats.attendancePercentage >= 75 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: history.stats.attendancePercentage >= 75 ? '#059669' : '#dc2626', fontWeight: '600'
                            }}>
                                {history.stats.attendancePercentage >= 75 ? 'Excellent Standing' : 'Needs Improvement'}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentDashboard;
