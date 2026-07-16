import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import "./index.css";
import "@rentbook/rentbook-ui-lib/microfrontend.min.css";

import Profile from "./pages/Profile";
import AddressPage from "./pages/AddressPage";
import { WidgetOptions } from "./index.widget";

const queryClient = new QueryClient();

interface AppProps {
  options?: WidgetOptions;
}

function App({ options }: AppProps) {

  return (
    <QueryClientProvider client={queryClient}>
      {options?.view === "address" ? <AddressPage /> : <Profile />}
    </QueryClientProvider>
  );
}

export default App;