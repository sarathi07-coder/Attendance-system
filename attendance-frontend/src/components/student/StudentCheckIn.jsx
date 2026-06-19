import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';

const StudentCheckIn = () => {
    const [searchParams] = useSearchParams();
    const [rollNo, setRollNo] = useState('');
    const [qrToken, setQrToken] = useState('');
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const tokenFromURL = searchParams.get('token');
        if (tokenFromURL) {
            setQrToken(tokenFromURL);
        }
    }, [searchParams]);

    const handleCheckIn = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setStatus(null);

        try {
            const res = await api.post('/student/checkin', {
                rollNo: rollNo.trim(),
                qrToken: qrToken.trim()
            });

            if (res.data.success) {
                setStatus({
                    success: true,
                    message: res.data.message,
                    studentName: res.data.studentName,
                    section: res.data.section,
                    session: res.data.session,
                    submissionTime: res.data.submissionTime,
                    alreadySubmitted: res.data.alreadySubmitted
                });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to check in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatSession = (session) => {
        const sessions = {
            'MORNING_1': 'Morning Session 1',
            'MORNING_2': 'Morning Session 2',
            'AFTERNOON_1': 'Afternoon Session 1',
            'AFTERNOON_2': 'Afternoon Session 2'
        };
        return sessions[session] || session;
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="glass-card animate-fade-in" style={{ padding: '40px', width: '100%', maxWidth: '440px' }}>
                {!status ? (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <div style={{ fontSize: '56px', marginBottom: '10px' }}>📱</div>
                            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e293b', margin: '0 0 10px 0' }}>
                                Attendance Check-In
                            </h1>
                            <p style={{ color: '#64748b', margin: 0 }}>Enter your roll number to mark attendance</p>
                            {qrToken && (
                                <div style={{
                                    background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', padding: '10px', marginTop: '15px',
                                    color: '#059669', fontSize: '0.9rem', fontWeight: '500'
                                }}>
                                    ✓ QR Code detected automatically
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>Roll Number *</label>
                                <input
                                    type="text"
                                    value={rollNo}
                                    onChange={(e) => setRollNo(e.target.value)}
                                    placeholder="e.g., 24102116"
                                    required
                                    autoFocus
                                    style={{
                                        width: '100%', padding: '16px', borderRadius: '12px',
                                        border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.8)',
                                        outline: 'none', fontSize: '1.2rem', textAlign: 'center', fontWeight: '600', letterSpacing: '1px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {!searchParams.get('token') && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>QR Token</label>
                                    <input
                                        type="text"
                                        value={qrToken}
                                        onChange={(e) => setQrToken(e.target.value)}
                                        placeholder="Paste token if not scanned"
                                        required
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: '10px',
                                            border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.8)',
                                            outline: 'none', fontSize: '0.9rem', fontFamily: 'monospace', boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            )}

                            {error && (
                                <div style={{
                                    background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626',
                                    padding: '12px', borderRadius: '10px', fontSize: '0.9rem', textAlign: 'center'
                                }}>
                                    ❌ {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !rollNo || !qrToken}
                                className="glass-btn"
                                style={{ width: '100%', fontSize: '1.1rem', padding: '16px' }}
                            >
                                {loading ? 'Checking In...' : 'Mark Present'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '80px', marginBottom: '20px' }}>
                            {status.alreadySubmitted ? '📋' : '✅'}
                        </div>
                        <h2 style={{
                            fontSize: '1.8rem', fontWeight: '700',
                            color: status.alreadySubmitted ? '#f59e0b' : '#10b981',
                            margin: '0 0 10px 0'
                        }}>
                            {status.alreadySubmitted ? 'Already Marked!' : 'Attendance Marked!'}
                        </h2>

                        <div style={{
                            background: 'rgba(255,255,255,0.5)', borderRadius: '16px', padding: '24px',
                            marginTop: '24px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.6)'
                        }}>
                            <div style={{ marginBottom: '15px' }}>
                                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Student Name</span>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>{status.studentName}</div>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Session</span>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--primary)' }}>{formatSession(status.session)}</div>
                            </div>
                            <div>
                                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Check-In Time</span>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#374151' }}>{new Date(status.submissionTime).toLocaleTimeString()}</div>
                            </div>
                        </div>

                        <p style={{ marginTop: '24px', color: '#10b981', fontWeight: '600' }}>
                            ✓ You can close this page now
                        </p>

                        <button
                            onClick={() => {
                                setStatus(null);
                                setRollNo('');
                                if (!searchParams.get('token')) setQrToken('');
                            }}
                            className="glass-btn"
                            style={{ marginTop: '16px', background: 'white', color: 'var(--primary)', border: '1px solid var(--primary)' }}
                        >
                            Check In Another Student
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentCheckIn;
