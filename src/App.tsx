import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import "./i18n";
import { AuthProvider } from "./contexts/auth-context";
import { ProtectedRoute, AdminRoute } from "./components/auth/protected-route";
import CoursePage from "./app/courses/index-page/course-page";
import NewCoursePage from "./app/courses/new-course-page/new-course-page";
import { CourseDetail } from "./app/courses/detail-page/course-detail";
import { LabDetail } from "./app/labs/detail-page/lab-detail";
import LabPage from "./app/labs/index-page/lab-page";
import UserPage from "./app/user/user-page";
import SubjectPage from "./app/subject/subject-page";
import CategoryPage from "./app/category/category-page";
import InstanceTypePage from "./app/instancetype/instance-type-page";
import LoginPage from "./app/auth/login-page";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Home - Dashboard */}
            <Route index element={<SubjectPage />} />

            {/* Courses Section - Tất cả user đã login */}
            <Route path="courses">
              <Route index element={<CoursePage />} />
              <Route path="new" element={<NewCoursePage />} />
              <Route path=":courseId" element={<CourseDetail />} />
            </Route>

            {/* Labs Section - Tất cả user đã login */}
            <Route path="labs">
              <Route index element={<LabPage />} />
              <Route path=":labId" element={<LabDetail />} />
            </Route>

            {/* Subjects Section - Tất cả user đã login */}
            <Route path="subjects" element={<SubjectPage />} />

            {/* Admin Only Routes - Chỉ admin */}
            <Route path="users">
              <Route
                index
                element={
                  <AdminRoute>
                    <UserPage />
                  </AdminRoute>
                }
              />
            </Route>

            <Route path="categories">
              <Route
                index
                element={
                  <AdminRoute>
                    <CategoryPage />
                  </AdminRoute>
                }
              />
            </Route>

            <Route path="instancetypes">
              <Route
                index
                element={
                  <AdminRoute>
                    <InstanceTypePage />
                  </AdminRoute>
                }
              />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
