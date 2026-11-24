import { IncidentProvider } from '@/capabilities/incidents';
import { MainRouter } from '@/routes/MainRouter';

const App = () => (
  <IncidentProvider>
    <MainRouter />
  </IncidentProvider>
);

export default App;
