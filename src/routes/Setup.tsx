import { useEffect, useState } from "react";

export default function Setup() {
  // Add state for carousel
  const [currentImage, setCurrentImage] = useState(1);
  const totalImages = 9;

  // Image descriptions for the carousel
  const imageDescriptions = [
    "Power on the gameboy and connect it to the VFD control panel. Select the setup option from the main menu and click on the quick setup.",
    "You want to factory reset the VFD (If you are commissioning then there should be no code uploaded on the VFD, so this is fine).",
    "Now you can keep all the default settings of the VFD control panel. Go to the bottom of the settings and click the I/O setup.",
    "In the I/O setup click on the option (9) Standard IO with MOP. This is a setting the conveyor controller is designed to work with.",
    "Confirm your selection by holding the OK button for 2 seconds.",
    "You should see this notification.",
    "Now the control panel should be sending you this fault. It is not relevant though, so just click Acknowledge all.",
    "After clicking to acknowledge, everything should be okay.",
    "The VFD is now properly configured for use with the conveyor controller.",
  ];

  // Function to navigate carousel
  const navigateCarousel = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentImage((current) => (current === 1 ? totalImages : current - 1));
    } else {
      setCurrentImage((current) => (current === totalImages ? 1 : current + 1));
    }
  };

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
      <div className="card bg-base-100 shadow-lg">
        <figure className="px-6 pt-6">
          <img
            src=""
            alt="How the proper setup of the VFD with the conveyor controller looks like."
            className="rounded-lg"
          />
        </figure>
        <div className="card-body text-sm italic">
          How the proper setup of the VFD with the conveyor controller looks
          like.
        </div>
      </div>
      <p className="text-base-content mb-4">
        The conveyor controller can be used locally or remotely. Local mode can
        be used without connecting the device's power cable, but you will be
        unable to see the speed the conveyor is going on the LCD. If you connect
        the power cable to the conveyor controller and set up your WiFi network,
        you can access the device remotely. It's possible to control more than
        one conveyor using more conveyor controller devices which are connected
        on one network.
      </p>
      <div className="card bg-base-100 shadow-lg">
        <figure className="px-6 pt-6">
          <img
            src=""
            alt="Image where you can see what each of the buttons mean on the conveyor controller."
            className="rounded-lg"
          />
        </figure>
        <div className="card-body text-sm italic">
          Image showing what each of the buttons mean on the conveyor
          controller.
        </div>
      </div>

      <h2
        id="vfd"
        className="text-2xl font-semibold text-secondary mb-4 mt-8 border-l-4 border-secondary pl-3"
      >
        How to set up the conveyor's VFD
      </h2>
      <p className="text-base-content mb-4">
        Follow these steps to set up the VFD using the gameboy controller:
      </p>

      {/* VFD Setup Image Carousel */}
      <div className="card bg-base-100 shadow-lg mb-6">
        <figure className="px-6 pt-6 relative">
          <img
            src={`/images/gbsetup${currentImage}.jpg`}
            alt={`VFD Setup Step ${currentImage}`}
            className="rounded-lg"
          />
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <button
              onClick={() => navigateCarousel("prev")}
              className="bg-base-300 hover:bg-primary text-primary hover:text-white p-2 rounded-full shadow-lg"
              aria-label="Previous image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => navigateCarousel("next")}
              className="bg-base-300 hover:bg-primary text-primary hover:text-white p-2 rounded-full shadow-lg"
              aria-label="Next image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </figure>
        <div className="card-body text-sm italic">
          <p>{imageDescriptions[currentImage - 1]}</p>
          <div className="flex justify-center space-x-1 mt-2">
            {Array.from({ length: totalImages }).map((_, i) => (
              <button
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i + 1 === currentImage ? "bg-primary" : "bg-base-300"
                }`}
                onClick={() => setCurrentImage(i + 1)}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

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
