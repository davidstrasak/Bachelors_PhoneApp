import { useState, useEffect } from "react";
import { Network } from "@capacitor/network";
import type { PluginListenerHandle } from "@capacitor/core";
import ScrollToTop from "../components/ScrollToTop";
import { Wifi, AlertTriangle, Settings } from "lucide-react";

export default function Help() {
  const [networkStatus, setNetworkStatus] = useState<string>("");

  useEffect(() => {
    async function getTheNetworkStatus() {
      const status = await Network.getStatus();
      setNetworkStatus(JSON.stringify(status));
    }

    getTheNetworkStatus();

    // Set up listener for network status changes
    let listenerHandle: PluginListenerHandle | null = null;

    Network.addListener("networkStatusChange", (status) => {
      setNetworkStatus(JSON.stringify(status));
    }).then((handle) => {
      listenerHandle = handle;
    });

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, []);

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
    <div className="container mx-auto px-4 pb-36 max-w-3xl">
      <nav className="bg-base-200 p-4 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold text-primary mb-4">
          Table of Contents
        </h2>
        <ul className="space-y-2 list-disc pl-5">
          <li>
            <a
              href="#troubleshooting"
              className="text-secondary hover:underline"
            >
              Troubleshooting
            </a>
            <ul className="pl-5 mt-1 space-y-1 list-[circle]">
              <li>
                <a
                  href="#network-issues"
                  className="text-secondary hover:underline"
                >
                  Network Status
                </a>
              </li>
              <li>
                <a
                  href="#connection-issues"
                  className="text-secondary hover:underline"
                >
                  Conveyors are offline
                </a>
              </li>
              <li>
                <a
                  href="#control-issues"
                  className="text-secondary hover:underline"
                >
                  Conveyor is not moving
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <h2
        id="troubleshooting"
        className="text-2xl font-semibold text-secondary mb-4 mt-8 border-l-4 border-secondary pl-3"
      >
        Troubleshooting
      </h2>

      <div className="space-y-6">
        {/* Network Status Section */}
        <div
          id="network-issues"
          className="bg-base-200 p-4 rounded-lg shadow-md"
        >
          <h3 className="text-xl font-semibold text-primary mb-3 flex items-center">
            <Wifi className="w-5 h-5 mr-2" />
            Network Status
          </h3>

          {networkStatus && (
            <div className="mb-4">
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    JSON.parse(networkStatus).connected
                      ? "bg-success"
                      : "bg-error"
                  }`}
                ></div>
                <span className="font-medium">
                  {JSON.parse(networkStatus).connected
                    ? "Connected"
                    : "Disconnected"}
                </span>
              </div>
              <div className="text-base-content opacity-70 mt-1">
                Connection Type:{" "}
                {JSON.parse(networkStatus).connectionType || "Unknown"}
              </div>
            </div>
          )}

          <p className="text-base-content mb-3">
            A stable network connection is required to communicate with conveyor
            controllers. If your connection indicates "Disconnected" above, try
            the following:
          </p>

          <ul className="list-disc pl-5 space-y-2">
            <li>Ensure your device's WiFi is turned on</li>
            <li>Verify the WiFi hotspot is set up as expected</li>
            <li>Restart your device's WiFi connection</li>
          </ul>
        </div>

        {/* Connection Issues Section */}
        <div
          id="connection-issues"
          className="bg-base-200 p-4 rounded-lg shadow-md"
        >
          <h3 className="text-xl font-semibold text-primary mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Conveyors are offline
          </h3>

          <p className="text-base-content mb-3">
            If conveyors show as "Offline" on the main screen:
          </p>

          <ul className="list-disc pl-5 space-y-2 mb-3">
            <li>Verify that the IP address was entered correctly</li>
            <li>
              Check if the conveyor controller has power (LCD screen should be
              on)
            </li>
            <li>Move closer to the conveyor</li>
            <li>Try removing and re-adding the conveyor</li>
          </ul>

          <div className="bg-base-300 p-3 rounded-md">
            <p className="text-sm">
              <strong>Technical Note:</strong> The app will automatically
              attempt to reconnect to offline conveyors every 2 seconds and will
              update the status as soon as the connection is restored.
            </p>
          </div>
        </div>

        {/* Conveyor not moving */}
        <div
          id="control-issues"
          className="bg-base-200 p-4 rounded-lg shadow-md"
        >
          <h3 className="text-xl font-semibold text-primary mb-3 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Conveyor is not moving
          </h3>

          <p className="text-base-content mb-3">
            If the system works well, but the conveyor is not moving:
          </p>

          <ul className="list-disc pl-5 space-y-2 mb-3">
            <li>
              The VFD might have a brake enabled. To disable the brake connect
              the gameboy, go to parameters and set p1215 parameter to value 2.
            </li>
          </ul>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
