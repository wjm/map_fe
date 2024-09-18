import TitleBar from "@/app/components/TitleBar/TitleBar";
import Info from "./frontpage";
import { SessionProvider } from "next-auth/react";


export default async function Home() {



  return (
    <div className="app">
      <SessionProvider>
      <TitleBar title="Map Collab" />
      <div>
        <Info />
      </div>
      </SessionProvider>
    </div>
  );
}