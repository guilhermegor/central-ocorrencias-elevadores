import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import { DashboardPage, NewIncidentPage, NoticeBanner, QueuePage } from '@/capabilities/incidents';
import { AppLayout } from '@/shared/components/AppLayout';

const basename = (process.env.PUBLIC_PATH || '/').replace(/\/$/, '');

export function MainRouter() {
  return (
    <BrowserRouter basename={basename}>
      <AppLayout>
        <NoticeBanner />
        <Routes>
          <Route path="/" element={<QueuePage />} />
          <Route path="/nova" element={<NewIncidentPage />} />
          <Route path="/painel" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
