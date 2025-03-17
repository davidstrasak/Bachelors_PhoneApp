import { useState, useEffect } from "react";
import { Network } from "@capacitor/network";

export default function Help() {
  const [networkStatus, setNetworkStatus] = useState<string>("");

  useEffect(() => {
    async function getTheNetworkStatus() {
      const status = await Network.getStatus();
      setNetworkStatus(JSON.stringify(status));
    }

    getTheNetworkStatus();
  }, []);
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Network Status</h2>
      <p>You are:</p>
      {networkStatus && (
        <div className="">
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${
                JSON.parse(networkStatus).connected
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            ></div>
            <span className="font-medium">
              {JSON.parse(networkStatus).connected
                ? "Connected"
                : "Disconnected"}
            </span>
          </div>
          <div className="text-gray-600">
            Connection Type:{" "}
            {JSON.parse(networkStatus).connectionType || "Unknown"}
          </div>
        </div>
      )}
    </div>
  );
}
