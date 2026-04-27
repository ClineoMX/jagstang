import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import PatientForm from './pages/PatientForm';
import CalendarPage from './pages/Calendar';
import NoteForm from './pages/NoteForm';
import FormNoteForm from './pages/FormNoteForm';
import DoctorProfile from './pages/DoctorProfile';
import Library from './pages/Library';
import DocumentsList from './pages/library/DocumentsList';
import TemplatesList from './pages/library/TemplatesList';
import TemplateEditor from './pages/library/TemplateEditor';
import FormsList from './pages/library/FormsList';
import FormEditor from './pages/library/FormEditor';
import Compliance from './pages/Compliance';
import ContactList from './pages/ContactList';
import ContactForm from './pages/ContactForm';
import TemplateFillForm from './pages/TemplateFillForm';

// Components
import Layout from './components/Layout';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/landing" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <Layout>
              <PatientList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/new"
        element={
          <ProtectedRoute>
            <Layout>
              <PatientForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:patientSlug"
        element={
          <ProtectedRoute>
            <Layout>
              <PatientDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:patientSlug/notes/new"
        element={
          <ProtectedRoute>
            <Layout>
              <NoteForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:patientSlug/notes/:noteId/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <NoteForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:patientSlug/notes/new-form"
        element={
          <ProtectedRoute>
            <Layout>
              <FormNoteForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/patients/:patientSlug/notes/:noteId/edit-form"
        element={
          <ProtectedRoute>
            <Layout>
              <FormNoteForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <Layout>
              <CalendarPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance"
        element={
          <ProtectedRoute>
            <Layout>
              <Compliance />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <DoctorProfile />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <Layout>
              <Library />
            </Layout>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/library/documents" replace />} />
        <Route path="documents" element={<DocumentsList />} />
        <Route path="templates" element={<TemplatesList />} />
        <Route path="forms" element={<FormsList />} />
      </Route>
      <Route
        path="/library/templates/new"
        element={
          <ProtectedRoute>
            <Layout>
              <TemplateEditor />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/library/templates/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <TemplateEditor />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/library/forms/new"
        element={
          <ProtectedRoute>
            <Layout>
              <FormEditor />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/library/forms/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <FormEditor />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/formularios"
        element={<Navigate to="/library/forms" replace />}
      />
      <Route
        path="/templates/fill"
        element={
          <ProtectedRoute>
            <Layout>
              <TemplateFillForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <Layout>
              <ContactList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts/new"
        element={
          <ProtectedRoute>
            <Layout>
              <ContactForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <ContactForm />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ChakraProvider>
    </>
  );
};

export default App;
