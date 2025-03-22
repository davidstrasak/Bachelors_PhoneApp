import { useState, useEffect, useRef } from "react";
import {
  PlusCircle,
  Trash2,
  Power,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { CapacitorHttp } from "@capacitor/core";
import { HttpOptions } from "@capacitor/core/types/core-plugins";

interface ConveyorControl {
  id: string;
  ip: string;
  name: string;
  isConveyorOn: boolean;
  isSpeedUpOn: boolean;
  isSpeedDownOn: boolean;
  // Add new fields for data from API
  speed?: number;
  controlMode?: string;
  isOnline?: boolean;
}

export default function Home() {
  const [conveyors, setConveyors] = useState<ConveyorControl[]>([]);
  const [newIp, setNewIp] = useState("");
  const [newName, setNewName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dataFetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [failedIPs, setFailedIPs] = useState<string[]>([]);

  useEffect(() => {
    console.log(conveyors);
  }, [conveyors]);

  useEffect(() => {
    const savedConveyors = localStorage.getItem("conveyors");
    if (savedConveyors) {
      setConveyors(JSON.parse(savedConveyors));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("conveyors", JSON.stringify(conveyors));
  }, [conveyors]);

  // Update the addConveyor function to immediately fetch data for the new conveyor
  const addConveyor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIp) {
      const newConveyor = {
        id: Date.now().toString(),
        ip: newIp,
        name: newName || `Conveyor ${conveyors.length + 1}`,
        isConveyorOn: false,
        isSpeedUpOn: false,
        isSpeedDownOn: false,
      };

      setConveyors((prevConveyors) => [...prevConveyors, newConveyor]);
      setNewIp("");
      setNewName("");

      // Fetch data for the new conveyor after a short delay to allow state update
      setTimeout(() => {
        fetchAllConveyorsData();
      }, 100);
    }
  };

  const removeConveyor = (id: string) => {
    setConveyors(conveyors.filter((conv) => conv.id !== id));
  };

  const sendCommand = async (ip: string, command: string) => {
    try {
      const options: HttpOptions = {
        url: `http://${ip}/${command}`,
      };
      const response: any = await CapacitorHttp.get(options);
      setErrorMessage(null); // Clear any previous error message
      console.log(response);
      try {
        const responseData = await response.json();
        console.log("Response data:", responseData);
      } catch (error: any) {}
    } catch (error: any) {
      console.error("Command failed:", error);
      setErrorMessage(`Command failed for ${ip}: ${error.message}`);
    }

    setTimeout(() => {
      fetchAllConveyorsData();
    }, 500);
  };

  const toggleConveyor = (id: string) => {
    setConveyors(
      conveyors.map((conv) =>
        conv.id === id ? { ...conv, isConveyorOn: !conv.isConveyorOn } : conv
      )
    );
  };

  const toggleSpeedUp = (id: string) => {
    setConveyors(
      conveyors.map((conv) =>
        conv.id === id ? { ...conv, isSpeedUpOn: !conv.isSpeedUpOn } : conv
      )
    );
  };

  const toggleSpeedDown = (id: string) => {
    setConveyors(
      conveyors.map((conv) =>
        conv.id === id ? { ...conv, isSpeedDownOn: !conv.isSpeedDownOn } : conv
      )
    );
  };

  // Fix the fetchConveyorData function to use ip instead of ipAddress
  const fetchConveyorData = async (
    conveyor: ConveyorControl
  ): Promise<ConveyorControl> => {
    if (!conveyor.ip) return conveyor;

    try {
      const options: HttpOptions = {
        url: `http://${conveyor.ip}/getData`,
      };

      const response = await CapacitorHttp.get(options);

      if (!response.status || response.status < 200 || response.status >= 300) {
        throw new Error(`Failed to fetch data from ${conveyor.ip}`);
      }

      // Parse the response data
      let data;
      try {
        if (typeof response.data === "string") {
          data = JSON.parse(response.data);
        } else {
          data = response.data;
        }
      } catch (e) {
        console.error("Error parsing response:", e);
        throw new Error(`Invalid response from ${conveyor.ip}`);
      }

      // Return updated conveyor with data from API
      return {
        ...conveyor,
        speed: data.conveyorSpeed,
        controlMode: data.localRemote,
        isOnline: true,
      };
    } catch (error) {
      console.error(`Error fetching data from ${conveyor.ip}:`, error);
      // Return conveyor marked as offline
      return {
        ...conveyor,
        isOnline: false,
      };
    }
  };

  // Fix the fetchAllConveyorsData function to properly handle conveyor state
  const fetchAllConveyorsData = async () => {
    // Skip if no conveyors exist
    if (conveyors.length === 0) return;

    const newFailedIPs: string[] = [];

    // Create promises for all conveyors
    const updatedConveyorsPromises = conveyors.map(async (conveyor) => {
      try {
        const updatedConveyor = await fetchConveyorData({ ...conveyor });

        // If offline, add to failed IPs
        if (!updatedConveyor.isOnline) {
          newFailedIPs.push(conveyor.ip);
        }

        return updatedConveyor;
      } catch (error) {
        // If fetch throws, mark as offline and add to failed IPs
        newFailedIPs.push(conveyor.ip);
        return { ...conveyor, isOnline: false };
      }
    });

    // Wait for all fetches to complete
    const updatedConveyors = await Promise.all(updatedConveyorsPromises);

    // Update conveyors state - keep existing ID, name, etc.
    setConveyors((prevConveyors) => {
      // Create a mapping of existing conveyors by ID
      const updatedMap = updatedConveyors.reduce((map, conveyor) => {
        map[conveyor.id] = conveyor;
        return map;
      }, {} as Record<string, ConveyorControl>);

      // Update each conveyor while preserving other properties
      return prevConveyors.map((conveyor) => {
        if (updatedMap[conveyor.id]) {
          return {
            ...conveyor,
            speed: updatedMap[conveyor.id].speed,
            controlMode: updatedMap[conveyor.id].controlMode,
            isOnline: updatedMap[conveyor.id].isOnline,
          };
        }
        return conveyor;
      });
    });

    // Update failed IPs
    setFailedIPs(newFailedIPs);

    // Update error message based on failed IPs
    if (newFailedIPs.length > 0) {
      setErrorMessage(
        `Failed to connect to the following IP addresses: ${newFailedIPs.join(
          ", "
        )}`
      );
    } else if (errorMessage && errorMessage.includes("Failed to connect")) {
      // Clear error if there were previously failures but now all are working
      setErrorMessage(null);
    }
  };

  // Update the useEffect that sets up fetching to also run when conveyors change
  useEffect(() => {
    // Clear any existing interval
    if (dataFetchIntervalRef.current) {
      clearInterval(dataFetchIntervalRef.current);
    }

    // Skip if no conveyors exist
    if (conveyors.length === 0) return;

    // Fetch immediately
    fetchAllConveyorsData();

    // Set up a new interval
    dataFetchIntervalRef.current = setInterval(fetchAllConveyorsData, 2000);

    // Cleanup on unmount or when conveyors change
    return () => {
      if (dataFetchIntervalRef.current) {
        clearInterval(dataFetchIntervalRef.current);
      }
    };
  }, [conveyors.length]); // Depend on the number of conveyors

  return (
    <>
      {errorMessage && (
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{errorMessage}</span>
        </div>
      )}
      <form onSubmit={addConveyor} className="mb-8 space-y-4">
        <div className="space-y-2">
          <label htmlFor="ip">IP Address</label>
          <input
            id="ip"
            type="text"
            placeholder="192.168.X.YYY"
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            className="w-full input input-primary"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="name">Name (Optional)</label>
          <input
            id="name"
            type="text"
            placeholder="Which one is it?"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full input input-primary"
          />
        </div>
        <button type="submit" className="w-full btn btn-primary">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Conveyor
        </button>
      </form>
      <div className="space-y-4">
        {conveyors.map((conveyor) => (
          <div
            key={conveyor.id}
            className={`border-2 rounded-lg p-4 ${
              conveyor.isOnline === false
                ? "border-error opacity-60"
                : "border-base-content"
            }`}
          >
            <div className="">
              <div className="flex justify-between items-center mb-4">
                <div className="grid grid-cols-2 grid-rows-2">
                  <input
                    type="text"
                    className="font-semibold border-0"
                    value={conveyor.name ? conveyor.name : "unnamed"}
                    onChange={(e) => {
                      e.preventDefault();
                      setConveyors(
                        conveyors.map((conv) =>
                          conv.id === conveyor.id
                            ? { ...conv, name: e.target.value }
                            : conv
                        )
                      );
                    }}
                  />

                  <p className="text-sm text-muted-foreground">
                    {conveyor.ip}
                    {conveyor.isOnline === false && (
                      <span className="badge badge-error badge-sm ml-2">
                        Offline
                      </span>
                    )}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Speed:{" "}
                    {conveyor.speed !== undefined
                      ? `${conveyor.speed}%`
                      : "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {conveyor.controlMode || "Unknown"} Control
                  </p>
                </div>
                <button
                  className="btn btn-error btn-ghost"
                  onClick={() => removeConveyor(conveyor.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  className={`w-full btn ${
                    conveyor.isConveyorOn ? "btn-success" : "btn-error"
                  }`}
                  onClick={() => {
                    sendCommand(
                      conveyor.ip,
                      conveyor.isConveyorOn ? "conveyorOff" : "conveyorOn"
                    );
                    toggleConveyor(conveyor.id);
                  }}
                  disabled={conveyor.isOnline === false}
                >
                  <Power className="w-4 h-4 mr-2" />
                  {conveyor.isConveyorOn ? "ON" : "OFF"}
                </button>
                <button
                  className={`w-full btn ${
                    conveyor.isSpeedUpOn
                      ? "btn-success"
                      : "bg-base-content text-base-100"
                  }`}
                  onClick={() => {
                    sendCommand(
                      conveyor.ip,
                      conveyor.isSpeedUpOn ? "incSpeedOff" : "incSpeedOn"
                    );
                    toggleSpeedUp(conveyor.id);
                  }}
                  disabled={conveyor.isOnline === false}
                >
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Speed +
                </button>
                <button
                  className={`w-full btn ${
                    conveyor.isSpeedDownOn
                      ? "btn-success"
                      : "bg-base-content text-base-100"
                  }`}
                  onClick={() => {
                    sendCommand(
                      conveyor.ip,
                      conveyor.isSpeedDownOn ? "decSpeedOff" : "decSpeedOn"
                    );
                    toggleSpeedDown(conveyor.id);
                  }}
                  disabled={conveyor.isOnline === false}
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Speed -
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
