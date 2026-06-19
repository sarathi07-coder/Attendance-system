import api from './api';

export const attendanceService = {
    markAttendance: (data) => api.post('/attendance/mark', data),

    getAttendanceByDate: (date) => api.get(`/attendance/date/${date}`),

    getAttendanceByDateAndSection: (date, section) =>
        api.get(`/attendance/date/${date}/section/${section}`),

    getStudentHistory: (studentId, startDate, endDate) =>
        api.get(`/attendance/student/${studentId}`, {
            params: { startDate, endDate }
        }),

    resendMessages: (date) => api.post('/attendance/resend-messages', null, {
        params: { date }
    }),

    getAbsenteesCount: (date, section) => api.get('/attendance/absentees/count', {
        params: { date, section }
    })
};
