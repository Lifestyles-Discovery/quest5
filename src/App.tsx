import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router";

/**
 * Redirect legacy /properties URLs to new /deals URLs
 */
function LegacyPropertyRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/deals/${id}`} replace />;
}

function LegacyPropertyScenarioRedirect() {
  const { id, scenarioId } = useParams<{ id: string; scenarioId: string }>();
  return <Navigate to={`/deals/${id}/scenario/${scenarioId}`} replace />;
}

function LegacyEvaluationRedirect() {
  const { propertyId, evaluationId } = useParams<{
    propertyId: string;
    evaluationId: string;
  }>();
  return <Navigate to={`/deals/${propertyId}/scenario/${evaluationId}`} replace />;
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
import SharedEvaluationPage from "./features/evaluations/pages/SharedEvaluationPage";
import PrintEvaluationPage from "./features/evaluations/pages/PrintEvaluationPage";

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
            {/* Redirect root to deals */}
            <Route index element={<Navigate to="/deals" replace />} />

            {/* Deals (renamed from Properties - 37signals philosophy) */}
            <Route path="/deals" element={<PropertiesPage />} />
            <Route path="/deals/:id" element={<PropertyDetailPage />} />
            <Route path="/deals/:id/scenario/:scenarioId" element={<PropertyDetailPage />} />

            {/* Legacy /properties routes - redirect to /deals */}
            <Route path="/properties" element={<Navigate to="/deals" replace />} />
            <Route path="/properties/:id" element={<LegacyPropertyRedirect />} />
            <Route path="/properties/:id/scenario/:scenarioId" element={<LegacyPropertyScenarioRedirect />} />
            <Route path="/properties/:propertyId/evaluations/:evaluationId" element={<LegacyEvaluationRedirect />} />

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

        {/* Public Sharing Routes (no auth required) */}
        <Route path="/share/:propertyId/:evaluationId/:guid" element={<SharedEvaluationPage />} />
        <Route path="/share/:propertyId/:evaluationId/:guid/:editKey" element={<SharedEvaluationPage />} />

        {/* Print Route for Restpack PDF generation (session key auth) */}
        <Route path="/properties/:propertyId/evaluations/:evaluationId/sessions/:sessionKey" element={<PrintEvaluationPage />} />

        {/* Error Pages */}
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/500" element={<FiveZeroZero />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
