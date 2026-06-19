import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import StudentList from './components/students/StudentList';
import StudentCheckIn from './components/student/StudentCheckIn';
import StudentLogin from './components/student/StudentLogin';
import StudentDashboard from './components/student/StudentDashboard';
import Sidebar from './components/layout/Sidebar';
import { authService } from './services/authService';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const isStudentAuthenticated = () => !!localStorage.getItem('studentToken');

    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
    };

    // Layout component with sidebar for authenticated admin users
    const AuthenticatedLayout = ({ children }) => (
        <div className="app-container">
            <Sidebar onLogout={handleLogout} />
            {children}
        </div>
    );

    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route
                path="/checkin"
                element={<StudentCheckIn />}
            />

            {/* Student Routes */}
            <Route
                path="/student-login"
                element={isStudentAuthenticated() ? <Navigate to="/student-dashboard" /> : <StudentLogin />}
            />
            <Route
                path="/student-dashboard"
                element={<StudentDashboard />}
            />

            {/* Admin Protected Routes */}
            <Route
                path="/"
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
            />
            <Route
                path="/dashboard"
                element={isAuthenticated ? (
                    <AuthenticatedLayout>
                        <Dashboard />
                    </AuthenticatedLayout>
                ) : <Navigate to="/login" />}
            />
            <Route
                path="/students"
                element={isAuthenticated ? (
                    <AuthenticatedLayout>
                        <StudentList />
                    </AuthenticatedLayout>
                ) : <Navigate to="/login" />}
            />
        </Routes>
    );
}

export default App;
