import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';
import { AboutPage } from './pages/public/AboutPage';
import { PricingPage } from './pages/public/PricingPage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { ContactPage } from './pages/public/ContactPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { TermsPage } from './pages/public/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Authenticated Pages
import { DashboardPage } from './pages/authenticated/DashboardPage';
import { DocumentsPage } from './pages/authenticated/DocumentsPage';
import { DocumentDetailPage } from './pages/authenticated/DocumentDetailPage';
import { UploadPage } from './pages/authenticated/UploadPage';
import { ToolsHubPage } from './pages/authenticated/ToolsHubPage';
import { HistoryPage } from './pages/authenticated/HistoryPage';
import { FavoritesPage } from './pages/authenticated/FavoritesPage';
import { ProfilePage } from './pages/authenticated/ProfilePage';
import { SettingsPage } from './pages/authenticated/SettingsPage';

// Tools Pages
import { PdfToWordPage } from './pages/tools/PdfToWordPage';
import { PdfToPptPage } from './pages/tools/PdfToPptPage';
import { PdfToExcelPage } from './pages/tools/PdfToExcelPage';
import { MergePdfPage } from './pages/tools/MergePdfPage';
import { SplitPdfPage } from './pages/tools/SplitPdfPage';
import { CompressPdfPage } from './pages/tools/CompressPdfPage';
import { RotatePdfPage } from './pages/tools/RotatePdfPage';
import { PdfToImagePage } from './pages/tools/PdfToImagePage';
import { ImageToPdfPage } from './pages/tools/ImageToPdfPage';
import { WordToPdfPage } from './pages/tools/WordToPdfPage';
import { PptToPdfPage } from './pages/tools/PptToPdfPage';

// AI Pages
import { AIHubPage } from './pages/ai/AIHubPage';
import { AISummarizePage } from './pages/ai/AISummarizePage';
import { AIChatPage } from './pages/ai/AIChatPage';
import { AIExtractPage } from './pages/ai/AIExtractPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminDocumentsPage } from './pages/admin/AdminDocumentsPage';
import { AdminJobsPage } from './pages/admin/AdminJobsPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
              </Route>

              {/* Authenticated Workspace & Document Routes */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/documents/:id" element={<DocumentDetailPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/tools" element={<ToolsHubPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* Specific Document Tools */}
                <Route path="/tools/pdf-to-word" element={<PdfToWordPage />} />
                <Route path="/tools/pdf-to-ppt" element={<PdfToPptPage />} />
                <Route path="/tools/pdf-to-excel" element={<PdfToExcelPage />} />
                <Route path="/tools/merge-pdf" element={<MergePdfPage />} />
                <Route path="/tools/split-pdf" element={<SplitPdfPage />} />
                <Route path="/tools/compress-pdf" element={<CompressPdfPage />} />
                <Route path="/tools/rotate-pdf" element={<RotatePdfPage />} />
                <Route path="/tools/pdf-to-image" element={<PdfToImagePage />} />
                <Route path="/tools/image-to-pdf" element={<ImageToPdfPage />} />
                <Route path="/tools/word-to-pdf" element={<WordToPdfPage />} />
                <Route path="/tools/ppt-to-pdf" element={<PptToPdfPage />} />

                {/* AI Features */}
                <Route path="/ai" element={<AIHubPage />} />
                <Route path="/ai/summarize" element={<AISummarizePage />} />
                <Route path="/ai/chat" element={<AIChatPage />} />
                <Route path="/ai/extract" element={<AIExtractPage />} />
              </Route>

              {/* Admin Platform Management Routes */}
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/documents" element={<AdminDocumentsPage />} />
                <Route path="/admin/jobs" element={<AdminJobsPage />} />
                <Route path="/admin/logs" element={<AdminLogsPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
