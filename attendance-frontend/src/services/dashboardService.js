import api from './api';

export const dashboardService = {
    getStats: () => api.get('/dashboard/stats'),

    getTodayAbsentees: () => api.get('/dashboard/absentees/today'),

    getRegularAbsentees: () => api.get('/dashboard/absentees/regular')
};
