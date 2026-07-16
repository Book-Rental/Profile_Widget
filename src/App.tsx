import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css'
import "./index.css";
import "@rentbook/rentbook-ui-lib/microfrontend.min.css"
import Profile from './pages/Profile';


const queryClient = new QueryClient();

function App() {


     return (
    <QueryClientProvider client={queryClient}>
      <Profile />
    </QueryClientProvider>
  );
}
export default App
