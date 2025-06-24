import { useAtom } from "jotai";
import { screenAtom } from "./store/screens";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AuthProvider } from "./components/AuthProvider";
import {
  Home,
  Auth,
  IntroLoading,
  Outage,
  OutOfMinutes,
  Intro,
  Instructions,
  Conversation,
  FinalScreen,
  Settings,
} from "./screens";

function AppContent() {
  const [{ currentScreen }, setScreenState] = useAtom(screenAtom);

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <Home />;
      case "auth":
        return <Auth onSuccess={() => setScreenState({ currentScreen: "intro" })} />;
      case "introLoading":
        return <IntroLoading />;
      case "outage":
        return <Outage />;
      case "outOfMinutes":
        return <OutOfMinutes />;
      case "intro":
        return <Intro />;
      case "settings":
        return <Settings />;
      case "instructions":
        return <Instructions />;
      case "conversation":
        return <Conversation />;
      case "finalScreen":
        return <FinalScreen />;
      default:
        return <Home />;
    }
  };

  return (
    <main className="flex h-svh flex-col items-center justify-between gap-3 p-5 sm:gap-4 lg:p-8 bg-black">
      {currentScreen !== "introLoading" && currentScreen !== "home" && currentScreen !== "auth" && <Header />}
      {renderScreen()}
      {currentScreen !== "introLoading" && currentScreen !== "home" && currentScreen !== "auth" && <Footer />}
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;