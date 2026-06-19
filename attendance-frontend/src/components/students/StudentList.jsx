import { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';

export default function StudentList() {
    const [students, setStudents] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [formData, setFormData] = useState({
        rollNo: '',
        studentName: '',
        department: 'AIDS',
        studentPhone: '',
        parentPhone: '',
        email: '',
        enrollmentStatus: 'ACTIVE'
    });
    const [error, setError] = useState('');

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const response = await studentService.getAllStudents();
            setStudents(response.data);
        } catch (err) {
            console.error('Error loading students:', err);
        }
    };

    const handleOpenDialog = (student = null) => {
        if (student) {
            setEditingStudent(student);
            setFormData(student);
        } else {
            setEditingStudent(null);
            setFormData({ rollNo: '', studentName: '', department: 'AIDS', studentPhone: '', parentPhone: '', email: '', enrollmentStatus: 'ACTIVE' });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingStudent(null);
        setError('');
    };

    const handleSubmit = async () => {
        setError('');
        try {
            if (editingStudent) {
                await studentService.updateStudent(editingStudent.id, formData);
            } else {
                await studentService.createStudent(formData);
            }
            loadStudents();
            handleCloseDialog();
        } catch (err) {
            setError(err.response?.data || 'Failed to save student');
        }
    };

    const handleDeactivate = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await studentService.deactivateStudent(id);
                loadStudents();
            } catch (err) {
                console.error('Error deleting student:', err);
            }
        }
    };

    return (
        <div className="main-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e3a8a', marginBottom: '5px' }}>Student Management</h1>
                    <p style={{ color: '#64748b' }}>Manage all registered students ({students.length} total)</p>
                </div>
                <button className="glass-btn" onClick={() => handleOpenDialog()}>
                    + Add Student
                </button>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(37, 99, 235, 0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Roll No</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Name</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Department</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Student Phone</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Parent Phone</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Email</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Status</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                <td style={{ padding: '16px 20px', fontWeight: '600', color: '#1e293b' }}>{student.rollNo}</td>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: '600', fontSize: '14px'
                                        }}>
                                            {student.studentName?.charAt(0)}
                                        </div>
                                        <span style={{ fontWeight: '500' }}>{student.studentName}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <span style={{ padding: '4px 10px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', borderRadius: '6px', fontWeight: '500', fontSize: '0.85rem' }}>
                                        {student.department}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 20px', color: '#64748b' }}>{student.studentPhone || '-'}</td>
                                <td style={{ padding: '16px 20px', color: '#64748b' }}>{student.parentPhone || '-'}</td>
                                <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.9rem' }}>{student.email || '-'}</td>
                                <td style={{ padding: '16px 20px' }}>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                                        background: student.enrollmentStatus === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                                        color: student.enrollmentStatus === 'ACTIVE' ? '#059669' : '#6b7280'
                                    }}>
                                        {student.enrollmentStatus}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <button
                                        onClick={() => handleOpenDialog(student)}
                                        style={{ padding: '6px 12px', marginRight: '8px', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                                    >Edit</button>
                                    <button
                                        onClick={() => handleDeactivate(student.id)}
                                        style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                                    >Delete</button>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                    No students found. Click "Add Student" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Dialog */}
            {openDialog && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-card" style={{ padding: '30px', width: '100%', maxWidth: '450px', background: 'white' }}>
                        <h2 style={{ margin: '0 0 20px 0' }}>{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>

                        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>{error}</div>}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input
                                placeholder="Roll Number (e.g., 24102121)"
                                value={formData.rollNo}
                                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                                disabled={!!editingStudent}
                                style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', fontSize: '1rem' }}
                            />
                            <input
                                placeholder="Student Name"
                                value={formData.studentName}
                                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                                style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', fontSize: '1rem' }}
                            />
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', fontSize: '1rem', background: 'white' }}
                            >
                                <option value="AIDS">AIDS</option>
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="EEE">EEE</option>
                                <option value="MECH">MECH</option>
                                <option value="CIVIL">CIVIL</option>
                            </select>
                            <input
                                placeholder="Email (e.g., student@school.com)"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', fontSize: '1rem' }}
                            />
                            <input
                                placeholder="Student Phone (+91...)"
                                value={formData.studentPhone}
                                onChange={(e) => setFormData({ ...formData, studentPhone: e.target.value })}
                                style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', fontSize: '1rem' }}
                            />
                            <input
                                placeholder="Parent Phone (+91...)"
                                value={formData.parentPhone}
                                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                                style={{ padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', fontSize: '1rem' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                            <button onClick={handleCloseDialog} style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                            <button onClick={handleSubmit} className="glass-btn" style={{ flex: 1 }}>{editingStudent ? 'Update' : 'Create'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
