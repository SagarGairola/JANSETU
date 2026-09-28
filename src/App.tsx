import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DemoProvider } from './context';
import { Header } from './components/Header';
import { ProgressIndicator } from './components/ProgressIndicator';
import { Footer } from './components/Footer';

import { WelcomePage } from './pages/Welcome';
import { NeedInputPage } from './pages/NeedInput';
import { SchemesPage } from './pages/Schemes';
import { SchemeDetailsPage } from './pages/SchemeDetails';
import { EligibilityPage } from './pages/Eligibility';
import { ReadinessPage } from './pages/Readiness';
import { RequirementsPage } from './pages/Requirements';
import { NextActionPage } from './pages/NextAction';
import { OfficialApplicationPage } from './pages/OfficialApplication';
import { BlockerPage } from './pages/Blocker';

import './App.css';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <DemoProvider>
        <div className="jansetu-app">
          <Header />
          <ProgressIndicator />
          <div className="jansetu-main">
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/need" element={<NeedInputPage />} />
              <Route path="/schemes" element={<SchemesPage />} />
              <Route path="/scheme-details" element={<SchemeDetailsPage />} />
              <Route path="/eligibility" element={<EligibilityPage />} />
              <Route path="/readiness" element={<ReadinessPage />} />
              <Route path="/requirements" element={<RequirementsPage />} />
              <Route path="/next-action" element={<NextActionPage />} />
              <Route path="/official-application" element={<OfficialApplicationPage />} />
              <Route path="/blocker" element={<BlockerPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </DemoProvider>
    </BrowserRouter>
  );
};

export default App;
