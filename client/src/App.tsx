import Body from "./components/Body/Body";
import NavBar from "./components/NavBar/NavBar";
import "./App.css";
import FloatingBar from "./components/FloatingBar/Floatingbar";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./components/LandingPage/LandingPage";

const App = ({ keycloak }: { keycloak: any }) => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <>
          <NavBar keycloak={keycloak} />
          <LandingPage />
        </>
      ),
    },
    {
      path: "/landing-page",
      element: (
        <>
          <FloatingBar />
          <NavBar keycloak={keycloak} />
          <Body />
        </>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
