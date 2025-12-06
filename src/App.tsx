import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";

import "./i18n";

import CoursePage from "./app/courses/index-page/course-page";
import NewCoursePage from "./app/courses/new-course-page/new-course-page";

import { CourseDetail } from "./app/courses/detail-page/course-detail";
import { LabDetail } from "./app/labs/detail-page/lab-detail";
import LabPage from "./app/labs/index-page/lab-page";
import UserPage from "./app/user/user-page";
import SubjectPage from "./app/subject/subject-page";
import InstanceTypePage from "./app/instancetype/instance-type-page";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<SubjectPage />} />

          <Route path="courses">
            <Route index element={<CoursePage />} />
            <Route path="new" element={<NewCoursePage />} />
            <Route path=":courseId" element={<CourseDetail />} />
          </Route>

          <Route path="labs">
            <Route index element={<LabPage />} />
            <Route path=":labId" element={<LabDetail />} />
          </Route>
          <Route path="subjects" element={<SubjectPage />} />

          <Route path="users">
            <Route index element={<UserPage />} />
          </Route>
          <Route path="instancetypes">
            <Route index element={<InstanceTypePage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
