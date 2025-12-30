import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router";

/**
 * Redirect legacy evaluation URLs to new scenario URLs
 * /properties/:propertyId/evaluations/:evaluationId -> /properties/:propertyId/scenario/:evaluationId
 */
function LegacyEvaluationRedirect() {
  const { propertyId, evaluationId } = useParams<{
    propertyId: string;
    evaluationId: string;
  }>();
  return <Navigate to={`/properties/${propertyId}/scenario/${evaluationId}`} replace />;
}

// Layout
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { ProtectedRoute } from "./components/common/ProtectedRoute";

// Auth Pages
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import Reactivate from "./pages/AuthPages/Reactivate";

// Error Pages
import NotFound from "./pages/OtherPage/NotFound";
import FiveZeroZero from "./pages/OtherPage/FiveZeroZero";
import Maintenance from "./pages/OtherPage/Maintenance";

// Quest Features
import { PropertiesPage, PropertyDetailPage } from "./features/properties";
import { SearchPage } from "./features/search";
import { SettingsPage } from "./features/settings";
import { AdminPage } from "./features/admin";

// Demo pages kept for reference during development
import FormElements from "./pages/Forms/FormElements";
import FormLayout from "./pages/Forms/FormLayout";
import BasicTables from "./pages/Tables/BasicTables";
import DataTables from "./pages/Tables/DataTables";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Protected Routes - require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Redirect root to properties */}
            <Route index element={<Navigate to="/properties" replace />} />

            {/* Properties */}
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />
            <Route path="/properties/:id/scenario/:scenarioId" element={<PropertyDetailPage />} />

            {/* Legacy evaluation route - redirect to new scenario URL */}
            <Route
              path="/properties/:propertyId/evaluations/:evaluationId"
              element={<LegacyEvaluationRedirect />}
            />

            {/* Search */}
            <Route path="/search" element={<SearchPage />} />

            {/* Settings */}
            <Route path="/settings" element={<SettingsPage />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminPage />} />

            {/* Reference Pages (for development) */}
            <Route path="/ref/form-elements" element={<FormElements />} />
            <Route path="/ref/form-layout" element={<FormLayout />} />
            <Route path="/ref/basic-tables" element={<BasicTables />} />
            <Route path="/ref/data-tables" element={<DataTables />} />
          </Route>
        </Route>

        {/* Auth Routes (no layout) */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reactivate" element={<Reactivate />} />

        {/* Error Pages */}
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/500" element={<FiveZeroZero />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
