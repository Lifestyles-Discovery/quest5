import { BrowserRouter as Router, Routes, Route } from "react-router";

// Layout
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

// Auth Pages
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ResetPassword from "./pages/AuthPages/ResetPassword";

// Error Pages
import NotFound from "./pages/OtherPage/NotFound";
import FiveZeroZero from "./pages/OtherPage/FiveZeroZero";
import Maintenance from "./pages/OtherPage/Maintenance";

// Placeholder Dashboard (will be replaced with Quest dashboard)
import Blank from "./pages/Blank";

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
        {/* Main App Layout (authenticated routes) */}
        <Route element={<AppLayout />}>
          {/* Dashboard - temporary placeholder */}
          <Route index path="/" element={<Blank />} />

          {/* Quest Routes (to be implemented) */}
          {/* <Route path="/properties" element={<PropertyList />} /> */}
          {/* <Route path="/properties/:id" element={<PropertyDetail />} /> */}
          {/* <Route path="/search" element={<Search />} /> */}
          {/* <Route path="/settings" element={<Settings />} /> */}
          {/* <Route path="/admin" element={<Admin />} /> */}

          {/* Reference Pages (for development) */}
          <Route path="/ref/form-elements" element={<FormElements />} />
          <Route path="/ref/form-layout" element={<FormLayout />} />
          <Route path="/ref/basic-tables" element={<BasicTables />} />
          <Route path="/ref/data-tables" element={<DataTables />} />
        </Route>

        {/* Auth Routes (no layout) */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Error Pages */}
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/500" element={<FiveZeroZero />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
