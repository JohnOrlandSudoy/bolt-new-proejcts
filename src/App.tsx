import { useAtom } from "jotai";
import { screenAtom } from "./store/screens";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import {
  Home,
  IntroLoading,
  Outage,
  OutOfMinutes,
  Intro,
  Instructions,
  Conversation,
  FinalScreen,
  Settings,
  Auth,
  Profile,
  Chat,
} from "./screens";

function App() {
  const [{ currentScreen }] = useAtom(screenAtom);

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <Home />;
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
      case "auth":
        return <Auth />;
      case "profile":
        return <Profile />;
      case "chat":
        return <Chat />;
      default:
        return <Home />;
    }
  };

  const showHeaderFooter = !["introLoading", "home", "auth", "profile", "chat"].includes(currentScreen);

  return (
    <main className="flex h-svh flex-col items-center justify-between gap-3 p-5 sm:gap-4 lg:p-8 bg-black">
      {showHeaderFooter && <Header />}
      {renderScreen()}
      {showHeaderFooter && <Footer />}
    </main>
  );
}

export default App;