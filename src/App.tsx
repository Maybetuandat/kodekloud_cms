import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";

import "./i18n";

import CoursePage from "./app/courses/index-page/course-page";
import NewCoursePage from "./app/courses/new-course-page/new-course-page";
import { CourseDetail } from "./app/courses/detail-page/course-detail";
import { LabDetail } from "./app/labs/detail-page/lab-detail";
import LabPage from "./app/labs/index-page/lab-page";
import UserPage from "./app/user/index/user-page";
import SubjectPage from "./app/subject/subject-page";
import InstanceTypePage from "./app/instancetype/instance-type-page";
import LoginPage from "./app/login-page/login-page";
import { ProtectedRoute } from "./components/auth/protect-route";
import { AuthProvider } from "./contexts/auth-context";
import ProfilePage from "./app/profile-page/profile-page";
import UserDetailPage from "./app/user/detail/user-detail-page";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public route - Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/subjects" replace />} />

            {/* Subjects - ADMIN và LECTURER có quyền */}
            <Route
              path="subjects"
              element={
                <ProtectedRoute requiredRoles={["ROLE_ADMIN", "ROLE_LECTURER"]}>
                  <SubjectPage />
                </ProtectedRoute>
              }
            />

            {/* Courses - Tất cả users */}
            <Route path="courses">
              <Route index element={<CoursePage />} />
              <Route
                path="new"
                element={
                  <ProtectedRoute
                    requiredRoles={["ROLE_ADMIN", "ROLE_LECTURER"]}
                  >
                    <NewCoursePage />
                  </ProtectedRoute>
                }
              />
              <Route path=":courseId" element={<CourseDetail />} />
            </Route>

            {/* Labs - Tất cả users */}
            <Route path="labs">
              <Route index element={<LabPage />} />
              <Route path=":labId" element={<LabDetail />} />
            </Route>

            <Route path="profiles/:userId" element={<ProfilePage />} />

            <Route path="users">
              <Route index element={<UserPage />} />
              <Route path=":userId" element={<UserDetailPage />} />
            </Route>

            <Route
              path="instancetypes"
              element={
                <ProtectedRoute requiredRoles={["ROLE_ADMIN"]}>
                  <InstanceTypePage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch all - redirect to subjects */}
          <Route path="*" element={<Navigate to="/subjects" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
