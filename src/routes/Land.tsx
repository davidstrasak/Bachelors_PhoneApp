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
  speed?: number;
  controlMode?: string;
  isOnline?: boolean;
}

export default function Home() {
  const [conveyors, setConveyors] = useState<ConveyorControl[]>([]);
  const [newIp, setNewIp] = useState("");
  const [newName, setNewName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Interval reference for polling conveyor data
  const dataFetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [failedIPs, setFailedIPs] = useState<string[]>([]);

  // Log conveyor state changes for debugging
  useEffect(() => {
    console.log(conveyors);
  }, [conveyors]);

  // Load saved conveyors from localStorage on component mount
  useEffect(() => {
    const savedConveyors = localStorage.getItem("conveyors");
    if (savedConveyors) {
      setConveyors(JSON.parse(savedConveyors));
    }
  }, []);

  // Persist conveyor state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("conveyors", JSON.stringify(conveyors));
  }, [conveyors]);

  // Add a new conveyor to the system and fetch its initial data
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

      // Fetch initial data for the new conveyor after state update
      setTimeout(() => {
        fetchAllConveyorsData();
      }, 100);
    }
  };

  // Remove a conveyor from the system by ID
  const removeConveyor = (id: string) => {
    setConveyors(conveyors.filter((conv) => conv.id !== id));
  };

  // Custom timeout implementation to abort long-running HTTP requests
  const fetchWithTimeout = async (
    fetchPromise: Promise<any>,
    timeoutMs: number
  ) => {
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error("Request timed out"));
      }, timeoutMs);
    });

    try {
      // Race between the fetch and timeout - whichever resolves/rejects first wins
      return await Promise.race([fetchPromise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutId!);
    }
  };

  // Send a command to a specific conveyor and update its status
  const sendCommand = async (ip: string, command: string) => {
    try {
      const options: HttpOptions = {
        url: `http://${ip}/${command}`,
      };

      const response: any = await fetchWithTimeout(
        CapacitorHttp.get(options),
        3000 // Fail fast if conveyor is unresponsive
      );

      setErrorMessage(null);
      console.log(response);
      try {
        const responseData = await response.json();
        console.log("Response data:", responseData);
      } catch (error: any) {}
    } catch (error: any) {
      console.error("Command failed:", error);
      setErrorMessage(`Command failed for ${ip}: ${error.message}`);

      // Immediately mark the conveyor as offline when a command fails
      setConveyors((prevConveyors) =>
        prevConveyors.map((conv) =>
          conv.ip === ip ? { ...conv, isOnline: false } : conv
        )
      );
    }

    // Refresh all conveyor statuses shortly after sending a command
    setTimeout(() => {
      fetchAllConveyorsData();
    }, 500);
  };

  // UI state toggle functions
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

  // Fetch current data for a single conveyor
  const fetchConveyorData = async (
    conveyor: ConveyorControl
  ): Promise<ConveyorControl> => {
    if (!conveyor.ip) return conveyor;

    try {
      const options: HttpOptions = {
        url: `http://${conveyor.ip}/getData`,
      };

      const response = await fetchWithTimeout(
        CapacitorHttp.get(options),
        3000 // Quick timeout to detect offline conveyors faster
      );

      if (!response.status || response.status < 200 || response.status >= 300) {
        throw new Error(`Failed to fetch data from ${conveyor.ip}`);
      }

      // Parse response data, handling both string and object formats
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

      // Return conveyor with updated real-time data
      return {
        ...conveyor,
        speed: data.conveyorSpeed,
        controlMode: data.localRemote,
        isOnline: true,
      };
    } catch (error) {
      console.error(`Error fetching data from ${conveyor.ip}:`, error);
      // Mark conveyor as offline when requests fail
      return {
        ...conveyor,
        isOnline: false,
      };
    }
  };

  // Fetch current data for all conveyors in parallel
  const fetchAllConveyorsData = async () => {
    if (conveyors.length === 0) return;

    const newFailedIPs: string[] = [];

    // Create promises for all conveyor data fetches
    const updatedConveyorsPromises = conveyors.map(async (conveyor) => {
      try {
        const updatedConveyor = await fetchConveyorData({ ...conveyor });

        if (!updatedConveyor.isOnline) {
          newFailedIPs.push(conveyor.ip);
        }

        return updatedConveyor;
      } catch (error) {
        newFailedIPs.push(conveyor.ip);
        return { ...conveyor, isOnline: false };
      }
    });

    // Wait for all fetches to complete
    const updatedConveyors = await Promise.all(updatedConveyorsPromises);

    // Update conveyor state while preserving unrelated properties
    setConveyors((prevConveyors) => {
      // Create a mapping of fetched conveyor data by ID for efficient lookup
      const updatedMap = updatedConveyors.reduce((map, conveyor) => {
        map[conveyor.id] = conveyor;
        return map;
      }, {} as Record<string, ConveyorControl>);

      // Merge new data with existing conveyors
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

    setFailedIPs(newFailedIPs);

    // Update error message based on connection status
    if (newFailedIPs.length === 0) {
      // All conveyors are online, clear any error message
      setErrorMessage(null);
    } else {
      // Some conveyors are offline, show error with specific IPs
      setErrorMessage(
        `Failed to connect to the following IP addresses: ${newFailedIPs.join(
          ", "
        )}`
      );
    }
  };

  // Set up data polling when conveyors are added or removed
  useEffect(() => {
    // Clean up existing interval
    if (dataFetchIntervalRef.current) {
      clearInterval(dataFetchIntervalRef.current);
    }

    if (conveyors.length === 0) return;

    // Initial fetch immediately when conveyors change
    fetchAllConveyorsData();

    // Poll for data every 2 seconds
    dataFetchIntervalRef.current = setInterval(fetchAllConveyorsData, 2000);

    // Clean up on unmount or when conveyors change
    return () => {
      if (dataFetchIntervalRef.current) {
        clearInterval(dataFetchIntervalRef.current);
      }
    };
  }, [conveyors.length]);

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
