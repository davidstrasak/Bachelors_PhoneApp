import Header from "./Header.tsx";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Header />

      <main className="container mx-auto p-4 max-w-md mt-20">
        <header></header>
        <main>{children}</main>
        <footer></footer>
      </main>
    </>
  );
};

export default Layout;
