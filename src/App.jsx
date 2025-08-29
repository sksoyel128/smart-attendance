// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import Attendance from "./pages/Attendance";
import Attendance_Student from "./pages/Attendance_Student";
import StudentDashboard from "./pages/StudentDashboard";
import Setting from "./pages/Setting";
import ManageAssignments from "./pages/ManageAssignments";
import ManageStudents from "./pages/ManageStudents";
import TeacherSettings from "./pages/SettingTeacher";
import UploadNotes from "./pages/UploadNotes";
import SendReminder from "./pages/SendReminder";
import StudentAssignments from "./pages/StudentAssignments";
import ClassNotes from "./pages/ClassNotes";
import StudentReminders from "./pages/StudentReminders";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Student Routes */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-ClassNotes"
          element={
            <ProtectedRoute requiredRole="student">
              <ClassNotes/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-Assignments"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-attendance"
          element={
            <ProtectedRoute requiredRole="student">
              <Attendance_Student />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-reminders"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentReminders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-Setting"
          element={
            <ProtectedRoute requiredRole="student">
              <Setting />
            </ProtectedRoute>
          }
        />
        {/* Teacher Routes */}
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        /> 
        <Route
          path="/mark-attendance"
          element={
            <ProtectedRoute requiredRole="teacher">
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Manage-Assignments"
          element={
            <ProtectedRoute requiredRole="teacher">
              <ManageAssignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Manage-UploadNotes"
          element={
            <ProtectedRoute requiredRole="teacher">
              <UploadNotes/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/SendReminder"
          element={
            <ProtectedRoute requiredRole="teacher">
              <SendReminder/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Manage-Students"
          element={
            <ProtectedRoute requiredRole="teacher">
              <ManageStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Teacher-Settings"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherSettings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;