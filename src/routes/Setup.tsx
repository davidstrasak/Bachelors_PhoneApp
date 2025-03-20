import { useEffect } from "react";

export default function Setup() {
  // Add this effect to handle smooth scrolling with header offset
  useEffect(() => {
    // Function to handle anchor clicks
    const handleAnchorClick = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const target = mouseEvent.target as HTMLElement;
      if (
        target.tagName === "A" &&
        target.getAttribute("href")?.startsWith("#")
      ) {
        e.preventDefault();

        const targetId = target.getAttribute("href")!.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          // Get header height
          const header = document.querySelector("header");
          const headerHeight = header
            ? header.getBoundingClientRect().height
            : 0;

          // Calculate position
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerHeight - 20;

          // Scroll
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
    };

    // Add event listeners to all links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener("click", handleAnchorClick);
    });

    // Cleanup
    return () => {
      links.forEach((link) => {
        link.removeEventListener("click", handleAnchorClick);
      });
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-primary mb-6 border-b-2 border-primary pb-2">
        How to set up the connections and conveyor
      </h1>
      <nav className="bg-base-200 p-4 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-primary mb-4">
          Table of Contents
        </h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            <a href="#howdoesitwork" className="text-secondary hover:underline">
              How does this device work
            </a>
          </li>
          <li>
            <a href="#vfd" className="text-secondary hover:underline">
              How to set up the conveyor's VFD
            </a>
          </li>
          <li>
            <a href="#connections" className="text-secondary hover:underline">
              Where to connect the cables
            </a>
          </li>
          <li>
            <a href="#wifi" className="text-secondary hover:underline">
              How to set up the WiFi hotspot
            </a>
          </li>
          <li>
            <a href="#starting" className="text-secondary hover:underline">
              Starting the device
            </a>
          </li>
        </ul>
      </nav>
      <h2
        id="howdoesitwork"
        className="text-2xl font-semibold text-secondary mb-4 mt-8 border-l-4 border-secondary pl-3"
      >
        How does this device work
      </h2>
      <p className="text-base-content mb-4">
        This page is a guide to help you set up the conveyor controlling device.
        But first some information on how the device works.
      </p>
      <p className="text-base-content mb-4">
        The device is supposed to be connected to a properly set up Sinamics
        G120D VFD. You can set up the VFD using the gameboy. When the VFD is set
        up, you can disconnect the gameboy and only use the conveyor controller
        to move the conveyor.
      </p>
      <img
        src=""
        alt="How the proper setup of the VFD with the conveyor controller looks like."
      />
      <p className="text-base-content mb-4">
        The conveyor controller can be used locally or remotely. Local mode can
        be used without connecting the device's power cable, but you will be
        unable to see the speed the conveyor is going on the LCD. If you connect
        the power cable to the conveyor controller and set up your WiFi network,
        you can access the device remotely. It's possible to control more than
        one conveyor using more conveyor controller devices which are connected
        on one network.
      </p>
      <img
        src=""
        alt="Image where you can see what each of the buttons mean on the conveyor controller."
      />

      <h2
        id="vfd"
        className="text-2xl font-semibold text-secondary mb-4 mt-8 border-l-4 border-secondary pl-3"
      >
        How to set up the conveyor's VFD
      </h2>

      <h2
        id="connections"
        className="text-2xl font-semibold text-secondary mb-4 mt-8 border-l-4 border-secondary pl-3"
      >
        Where to connect the cables from the conveyor controller
      </h2>

      <h2
        id="wifi"
        className="text-2xl font-semibold text-secondary mb-4 mt-8 border-l-4 border-secondary pl-3"
      >
        How to set up the WiFi hotspot
      </h2>
      <p className="text-base-content mb-4">
        The conveyor controller device is expecting to connect to a specific
        WiFi network. It can be operated without the WiFi network when running
        on local mode, but you will be unable to access the LCD display
        information.
      </p>
      <p className="text-base-content mb-4">
        The microcontroller inside the conveyor controlling device expects these
        WiFi settings:
      </p>
      <ul className="bg-base-100 p-4 rounded-md shadow-sm mb-8 space-y-2">
        <li className="flex items-center">
          <span className="badge badge-primary mr-2">SSID</span> TP-Link_83CA
        </li>
        <li className="flex items-center">
          <span className="badge badge-primary mr-2">Password</span> 65362280
        </li>
      </ul>

      <h2
        id="starting"
        className="text-2xl font-semibold text-secondary mb-4 mt-8 border-l-4 border-secondary pl-3"
      >
        Starting the device
      </h2>
      <p className="text-base-content mb-4">
        Now make sure that the device has all the buttons in the correct
        positions like in the image here:
      </p>
      <div className="card bg-base-100 shadow-lg">
        <figure className="px-6 pt-6">
          <img
            src="/images/ControlPanelIOSetup.jpg"
            alt="Control Panel Setup"
            className="rounded-lg"
          />
        </figure>
        <div className="card-body text-sm italic">
          Yellow cable connected to the input that has DI0 and DI1 written on it
          and the black cable connected to the input to the right of it.
        </div>
      </div>
    </div>
  );
}
