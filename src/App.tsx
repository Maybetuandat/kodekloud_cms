import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";

import "./i18n";

import Lab from "./app/labs/lab-page";
import HomePage from "./app/home";
import LabDetail from "./app/labs/lab-detail";
import CoursePage from "./app/courses/CoursePage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />

        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />

        <Route
          path="/courses"
          element={
            <MainLayout>
              <CoursePage />
            </MainLayout>
          }
        />
        <Route
          path="/labs/:id"
          element={
            <MainLayout>
              <LabDetail />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
