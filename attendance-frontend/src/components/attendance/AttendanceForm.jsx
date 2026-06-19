import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    AppBar,
    Toolbar,
    IconButton,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Alert,
    Snackbar
} from '@mui/material';
import { ArrowBack, School } from '@mui/icons-material';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import { authService } from '../../services/authService';

export default function AttendanceForm({ onLogout }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [section, setSection] = useState('A');
    const [classBlock, setClassBlock] = useState('MORNING');
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    useEffect(() => {
        loadStudents();
    }, [section]);

    const loadStudents = async () => {
        try {
            const response = await studentService.getStudentsBySection(section);
            const activeStudents = response.data.filter(s => s.enrollmentStatus === 'ACTIVE');
            setStudents(activeStudents);

            // Initialize all as present
            const initialAttendance = {};
            activeStudents.forEach(student => {
                initialAttendance[student.id] = 'PRESENT';
            });
            setAttendance(initialAttendance);
        } catch (err) {
            console.error('Error loading students:', err);
        }
    };

    const handleAttendanceChange = (studentId, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleMarkAll = (status) => {
        const newAttendance = {};
        students.forEach(student => {
            newAttendance[student.id] = status;
        });
        setAttendance(newAttendance);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const promises = students.map(student => {
                return attendanceService.markAttendance({
                    studentId: student.id,
                    date: date,
                    section: section,
                    classBlock: classBlock,
                    status: attendance[student.id],
                    markedBy: user?.username
                });
            });

            await Promise.all(promises);
            setSuccess(true);
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            setError('Failed to mark attendance. Please try again.');
            console.error('Error marking attendance:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <AppBar position="static" sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <Toolbar>
                    <IconButton color="inherit" onClick={() => navigate('/')}>
                        <ArrowBack />
                    </IconButton>
                    <School sx={{ mr: 2 }} />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Mark Attendance
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                        Daily Attendance Entry
                    </Typography>

                    <Grid container spacing={3} mb={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                label="Date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Section</InputLabel>
                                <Select value={section} onChange={(e) => setSection(e.target.value)}>
                                    <MenuItem value="A">Section A</MenuItem>
                                    <MenuItem value="B">Section B</MenuItem>
                                    <MenuItem value="C">Section C</MenuItem>
                                    <MenuItem value="D">Section D</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Class Block</InputLabel>
                                <Select value={classBlock} onChange={(e) => setClassBlock(e.target.value)}>
                                    <MenuItem value="MORNING">Morning</MenuItem>
                                    <MenuItem value="MORNING_BREAK">Morning Break</MenuItem>
                                    <MenuItem value="AFTERNOON">Afternoon</MenuItem>
                                    <MenuItem value="AFTERNOON_BREAK">Afternoon Break</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Box display="flex" gap={1}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleMarkAll('PRESENT')}
                                    fullWidth
                                >
                                    All Present
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleMarkAll('ABSENT')}
                                    fullWidth
                                >
                                    All Absent
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <TableContainer sx={{ maxHeight: 500, mb: 3 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Roll No</strong></TableCell>
                                    <TableCell><strong>Student Name</strong></TableCell>
                                    <TableCell><strong>Present</strong></TableCell>
                                    <TableCell><strong>Absent</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>{student.rollNo}</TableCell>
                                        <TableCell>{student.studentName}</TableCell>
                                        <TableCell>
                                            <Checkbox
                                                checked={attendance[student.id] === 'PRESENT'}
                                                onChange={() => handleAttendanceChange(student.id, 'PRESENT')}
                                                color="success"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Checkbox
                                                checked={attendance[student.id] === 'ABSENT'}
                                                onChange={() => handleAttendanceChange(student.id, 'ABSENT')}
                                                color="error"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box display="flex" justifyContent="flex-end" gap={2}>
                        <Button variant="outlined" onClick={() => navigate('/')}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading || students.length === 0}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            }}
                        >
                            {loading ? 'Submitting...' : 'Submit Attendance'}
                        </Button>
                    </Box>
                </Paper>
            </Container>

            <Snackbar
                open={success}
                autoHideDuration={3000}
                onClose={() => setSuccess(false)}
                message="Attendance marked successfully!"
            />
        </Box>
    );
}
