import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";

import "./i18n";

import HomePage from "./app/home";

import CoursePage from "./app/courses/index-page/course-page";
import NewCoursePage from "./app/courses/new-course-page/new-course-page";

import CategoryPage from "./app/category/category-page";
import { CourseDetail } from "./app/courses/detail-page/course-detail";
import { LabDetail } from "./app/labs/detail-page/lab-detail";
import LabPage from "./app/labs/index-page/lab-page";
import UserPage from "./app/user/user-page";

function App() {
  return (
    <Router>
      <Routes>
        {/* Root Layout */}
        <Route path="/" element={<MainLayout />}>
          {/* Home */}
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />

          {/* Courses Section */}
          <Route path="courses">
            <Route index element={<CoursePage />} />
            <Route path="new" element={<NewCoursePage />} />
            <Route path=":courseId" element={<CourseDetail />} />
          </Route>

          <Route path="labs">
            <Route index element={<LabPage />} />
            <Route path=":labId" element={<LabDetail />} />
          </Route>
          {/* Category Section */}
          <Route path="category" element={<CategoryPage />} />

          <Route path="users">
            <Route index element={<UserPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
