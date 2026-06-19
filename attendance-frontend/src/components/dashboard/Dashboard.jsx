import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../services/api';

const Dashboard = () => {
    const [sessionData, setSessionData] = useState(null);
    const [regularAbsentees, setRegularAbsentees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState('MORNING_1');
    const [scanning, setScanning] = useState(false);
    const [lastScanned, setLastScanned] = useState(null);
    const [whatsappQR, setWhatsappQR] = useState(null);
    const [showWhatsappQR, setShowWhatsappQR] = useState(false);
    const [connectingWhatsapp, setConnectingWhatsapp] = useState(false);
    const [whatsappConnected, setWhatsappConnected] = useState(false);

    const [odStudents, setOdStudents] = useState([]);
    const [preInformedStudents, setPreInformedStudents] = useState([]);
    const [finalizing, setFinalizing] = useState(false);
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    // Check WhatsApp status on load
    useEffect(() => {
        const checkWhatsappStatus = async () => {
            try {
                const res = await fetch('http://localhost:3001/status');
                const data = await res.json();
                setWhatsappConnected(data.connected);
            } catch (e) {
                console.log('WhatsApp service not available');
            }
        };
        checkWhatsappStatus();
    }, []);

    const connectWhatsapp = async () => {
        setConnectingWhatsapp(true);
        try {
            await fetch('http://localhost:3001/connect', { method: 'POST' });
            let attempts = 0;
            const pollInterval = setInterval(async () => {
                try {
                    const statusRes = await fetch('http://localhost:3001/status');
                    const statusData = await statusRes.json();

                    if (statusData.connected) {
                        setWhatsappConnected(true);
                        setWhatsappQR(null);
                        setShowWhatsappQR(false);
                        setConnectingWhatsapp(false);
                        clearInterval(pollInterval);
                        return;
                    }

                    const qrRes = await fetch('http://localhost:3001/get-qr');
                    const qrData = await qrRes.json();

                    if (qrData.success && qrData.qr_image) {
                        setWhatsappQR(qrData.qr_image);
                        setShowWhatsappQR(true);
                        setConnectingWhatsapp(false);
                    }
                } catch (e) {
                    console.error("Polling error:", e);
                }

                attempts++;
                if (attempts > 30) {
                    clearInterval(pollInterval);
                    setConnectingWhatsapp(false);
                }
            }, 2000);

        } catch (error) {
            console.error('Error connecting WhatsApp:', error);
            setConnectingWhatsapp(false);
        }
    };

    const sessions = [
        { id: 'MORNING_1', name: 'Morning Session 1', time: '10:00 - 11:00 AM' },
        { id: 'MORNING_2', name: 'Morning Session 2', time: '11:15 - 12:15 PM' },
        { id: 'AFTERNOON_1', name: 'Afternoon Session 1', time: '01:00 - 02:00 PM' },
        { id: 'AFTERNOON_2', name: 'Afternoon Session 2', time: '02:15 - 03:15 PM' },
    ];

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 5000);
        return () => clearInterval(interval);
    }, [selectedSession]);

    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.clear().catch(console.error);
            }
        };
    }, []);

    const fetchDashboardData = async () => {
        try {
            console.log('Fetching data for session:', selectedSession);
            const summaryRes = await api.get(`/attendance/session-summary/${selectedSession}`);
            console.log('Session Data:', summaryRes.data);
            setSessionData(summaryRes.data);

            const absenteesRes = await api.get('/attendance/regular-absentees?threshold=3&days=30');
            setRegularAbsentees(absenteesRes.data);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const startScanner = () => {
        setScanning(true);
        setTimeout(() => {
            html5QrCodeRef.current = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
                false
            );
            html5QrCodeRef.current.render(onScanSuccess, onScanError);
        }, 100);
    };

    const stopScanner = () => {
        if (html5QrCodeRef.current) {
            html5QrCodeRef.current.clear().catch(console.error);
        }
        setScanning(false);
    };

    const onScanSuccess = async (decodedText) => {
        try {
            const parts = decodedText.split('-');
            if (parts.length >= 4) {
                const studentId = parseInt(parts[0]);
                const res = await api.post('/student/scan-checkin', {
                    studentId: studentId,
                    classBlock: selectedSession
                });

                if (res.data.success) {
                    setLastScanned({
                        success: true,
                        studentName: res.data.studentName,
                        rollNo: res.data.rollNo,
                        alreadyPresent: res.data.alreadySubmitted
                    });
                    fetchDashboardData();
                    setTimeout(() => setLastScanned(null), 3000);
                }
            }
        } catch (error) {
            setLastScanned({
                success: false,
                error: error.response?.data?.error || 'Invalid QR code'
            });
            setTimeout(() => setLastScanned(null), 3000);
        }
    };

    const onScanError = (errorMessage) => { };

    const toggleOD = (studentId) => {
        if (odStudents.includes(studentId)) {
            setOdStudents(odStudents.filter(id => id !== studentId));
        } else {
            setOdStudents([...odStudents, studentId]);
            setPreInformedStudents(preInformedStudents.filter(id => id !== studentId));
        }
    };

    const togglePreInformed = (studentId) => {
        if (preInformedStudents.includes(studentId)) {
            setPreInformedStudents(preInformedStudents.filter(id => id !== studentId));
        } else {
            setPreInformedStudents([...preInformedStudents, studentId]);
            setOdStudents(odStudents.filter(id => id !== studentId));
        }
    };

    const finalizeSession = async () => {
        if (!sessionData) return;
        const allNotSubmitted = sessionData.notSubmitted.map(s => s.studentId);
        const absentIds = allNotSubmitted.filter(
            id => !odStudents.includes(id) && !preInformedStudents.includes(id)
        );

        if (confirm(`Finalize ${selectedSession}? Messages will be sent to ${absentIds.length} parents.`)) {
            setFinalizing(true);
            try {
                await api.post('/attendance/finalize', {
                    classBlock: selectedSession,
                    absentStudentIds: absentIds,
                    odStudentIds: odStudents,
                    preInformedStudentIds: preInformedStudents,
                    finalizedBy: 'admin'
                });
                alert('✅ Session Finalized & Messages Sent!');
                setOdStudents([]);
                setPreInformedStudents([]);
                fetchDashboardData();
            } catch (error) {
                alert('Failed to finalize session');
            } finally {
                setFinalizing(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ color: 'var(--primary-blue)' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div className="main-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e3a8a', marginBottom: '5px' }}>Attendance Dashboard</h1>
                    <p style={{ color: '#64748b' }}>Manage student attendance and notifications</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="glass-btn"
                        onClick={fetchDashboardData}
                        style={{ background: 'white', color: '#64748b', border: '1px solid #e2e8f0' }}
                    >
                        🔄 Refresh
                    </button>

                    {!whatsappConnected && (
                        <button className="glass-btn" onClick={connectWhatsapp} disabled={connectingWhatsapp}>
                            {connectingWhatsapp ? 'Connecting...' : 'Connect WhatsApp'}
                        </button>
                    )}
                    {whatsappConnected && (
                        <div className="glass-card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                            <span style={{ fontSize: '10px' }}>●</span> WhatsApp Active
                        </div>
                    )}
                </div>
            </div>

            {/* Session Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {sessions.map(session => (
                    <div
                        key={session.id}
                        className="glass-card"
                        onClick={() => setSelectedSession(session.id)}
                        style={{
                            padding: '20px',
                            cursor: 'pointer',
                            border: selectedSession === session.id ? '2px solid var(--primary-blue)' : '1px solid var(--glass-border)',
                            background: selectedSession === session.id ? 'rgba(59, 130, 246, 0.1)' : 'var(--glass-bg)'
                        }}
                    >
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#1e293b' }}>{session.name}</h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{session.time}</p>
                        {selectedSession === session.id && sessionData && (
                            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                                <div style={{ fontSize: '0.9rem' }}><span style={{ color: '#10b981', fontWeight: '600' }}>{sessionData.submittedCount}</span> Present</div>
                                <div style={{ fontSize: '0.9rem' }}><span style={{ color: '#ef4444', fontWeight: '600' }}>{sessionData.notSubmittedCount}</span> Absent</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
                {/* Left Column: Lists */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                    {/* Not Scanned List */}
                    <div className="glass-card" style={{ padding: '25px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, color: '#ef4444' }}>Not Scanned ({sessionData?.notSubmittedCount || 0})</h3>
                            <button
                                className="glass-btn"
                                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}
                                onClick={finalizeSession}
                                disabled={finalizing || !sessionData?.notSubmitted?.length}
                            >
                                {finalizing ? 'Sending...' : 'Finalize & Send WhatsApp'}
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '500px', overflowY: 'auto' }}>
                            {sessionData?.notSubmitted && sessionData.notSubmitted.length > 0 ? (
                                sessionData.notSubmitted.map(student => (
                                    <div key={student.studentId} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '15px', background: 'rgba(255,255,255,0.5)', borderRadius: '12px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: '600', color: '#64748b'
                                            }}>
                                                {student.studentName?.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#1e293b' }}>{student.studentName}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Roll: {student.rollNo}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => toggleOD(student.studentId)}
                                                style={{
                                                    padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                                    background: odStudents.includes(student.studentId) ? '#f59e0b' : '#fef3c7',
                                                    color: odStudents.includes(student.studentId) ? 'white' : '#92400e',
                                                    fontWeight: '500', fontSize: '0.85rem'
                                                }}
                                            >OD</button>
                                            <button
                                                onClick={() => togglePreInformed(student.studentId)}
                                                style={{
                                                    padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                                    background: preInformedStudents.includes(student.studentId) ? '#64748b' : '#e2e8f0',
                                                    color: preInformedStudents.includes(student.studentId) ? 'white' : '#475569',
                                                    fontWeight: '500', fontSize: '0.85rem'
                                                }}
                                            >Pre-Info</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                                    {sessionData ? 'All students present! 🎉' : 'Loading students...'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Scanned List */}
                    <div className="glass-card" style={{ padding: '25px' }}>
                        <h3 style={{ margin: '0 0 20px 0', color: '#10b981' }}>Present ({sessionData?.submittedCount || 0})</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                            {sessionData?.submitted?.map(student => (
                                <div key={student.studentId} style={{
                                    padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px',
                                    border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '10px'
                                }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                                    <div>
                                        <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{student.studentName}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{student.rollNo}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Scanner */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div className="glass-card" style={{ padding: '25px', background: 'linear-gradient(145deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)' }}>
                        <h3 style={{ margin: '0 0 20px 0' }}>QR Scanner</h3>
                        {!scanning ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255,255,255,0.3)', borderRadius: '16px' }}>
                                <button className="glass-btn" onClick={startScanner}>Activate Camera</button>
                            </div>
                        ) : (
                            <div>
                                <div id="qr-reader" ref={scannerRef} style={{ borderRadius: '12px', overflow: 'hidden' }}></div>
                                <button className="glass-btn-secondary" onClick={stopScanner} style={{ width: '100%', marginTop: '15px', padding: '10px' }}>Stop Camera</button>
                            </div>
                        )}

                        {lastScanned && (
                            <div style={{
                                marginTop: '20px', padding: '15px', borderRadius: '12px',
                                background: lastScanned.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                border: `1px solid ${lastScanned.success ? '#10b981' : '#ef4444'}`,
                                textAlign: 'center'
                            }}>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{lastScanned.studentName}</div>
                                <div style={{ fontSize: '0.9rem' }}>{lastScanned.success ? 'Marked Present' : lastScanned.error}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* WhatsApp QR Modal */}
            {showWhatsappQR && whatsappQR && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-card" style={{ padding: '40px', background: 'white', textAlign: 'center' }}>
                        <h2 style={{ marginBottom: '20px' }}>Scan WhatsApp QR</h2>
                        <img src={`data:image/png;base64,${whatsappQR}`} alt="QR" style={{ width: '280px', height: '280px', marginBottom: '20px' }} />
                        <button className="glass-btn-secondary" onClick={() => setShowWhatsappQR(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
