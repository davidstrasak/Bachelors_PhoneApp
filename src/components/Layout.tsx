import Header from "./Header.tsx";
import { useEffect, useState } from "react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      setHeaderHeight(header.clientHeight);
    }
  }, []);

  return (
    <>
      <Header />
      <main
        className="container mx-auto p-4 max-w-md"
        style={{ marginTop: `${headerHeight + 10}px` }}
      >
        {children}
      </main>
      <footer></footer>
    </>
  );
};

export default Layout;
