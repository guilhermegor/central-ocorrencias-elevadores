import { HashRouter, Navigate, Route, Routes } from 'react-router';

import { DashboardPage, NewIncidentPage, NoticeBanner, QueuePage } from '@/capabilities/incidents';
import { AppLayout } from '@/shared/components/AppLayout';

export function MainRouter() {
  return (
    <HashRouter>
      <AppLayout>
        <NoticeBanner />
        <Routes>
          <Route path="/" element={<QueuePage />} />
          <Route path="/nova" element={<NewIncidentPage />} />
          <Route path="/painel" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  );
}
