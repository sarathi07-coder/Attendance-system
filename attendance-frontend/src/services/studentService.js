import api from './api';

export const studentService = {
    getAllStudents: () => api.get('/students'),

    getStudentsBySection: (section) => api.get(`/students/section/${section}`),

    getActiveStudents: () => api.get('/students/active'),

    getStudentById: (id) => api.get(`/students/${id}`),

    createStudent: (student) => api.post('/students', student),

    updateStudent: (id, student) => api.put(`/students/${id}`, student),

    deactivateStudent: (id) => api.delete(`/students/${id}`),

    getClassStrength: (section) => api.get(`/students/section/${section}/strength`)
};
