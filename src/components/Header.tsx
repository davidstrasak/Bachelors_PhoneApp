import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigationLinks = [
    { name: "Home", href: "/" },
    { name: "Setup", href: "/setup" },
    { name: "Help", href: "/help" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 transition-all duration-300 bg-base-300 backdrop-blur-sm shadow-sm pt-[30px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="text-xl font-bold text-primary"
              aria-label="Home page"
            >
              Conveyor Controller
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              {navigationLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className={`text-sm font-medium transition-colors duration-300 ${
                        isActive
                          ? "text-primary border-b-2 border-primary py-1"
                          : "text-base-content hover:text-primary"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-md p-2 text-base-content hover:bg-base-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out transform ${
          isMenuOpen
            ? "opacity-100 translate-y-0 h-auto"
            : "opacity-0 -translate-y-4 h-0 overflow-hidden"
        }`}
      >
        <div className="px-4 pb-4 pt-2 space-y-1 bg-base-100 shadow-lg">
          {navigationLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`block py-3 px-4 text-base font-medium rounded-md transition-colors duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-base-content hover:bg-base-100"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
