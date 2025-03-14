import { useState, useEffect } from "react";
import {
  PlusCircle,
  Trash2,
  Power,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface ConveyorControl {
  id: string;
  ip: string;
  name: string;
  isConveyorOn: boolean;
  isSpeedUpOn: boolean;
  isSpeedDownOn: boolean;
}

export default function Home() {
  const [conveyors, setConveyors] = useState<ConveyorControl[]>([]);
  const [newIp, setNewIp] = useState("");
  const [newName, setNewName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const addConveyor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIp) {
      setConveyors([
        ...conveyors,
        {
          id: Date.now().toString(),
          ip: newIp,
          name: newName || `Conveyor ${conveyors.length + 1}`,
          isConveyorOn: false,
          isSpeedUpOn: false,
          isSpeedDownOn: false,
        },
      ]);
      setNewIp("");
      setNewName("");
    }
  };

  const removeConveyor = (id: string) => {
    setConveyors(conveyors.filter((conv) => conv.id !== id));
  };

  const sendCommand = async (ip: string, command: string) => {
    try {
      const response = await fetch(`http://${ip}/${command}`);
      if (!response.ok) {
        throw new Error(
          `Failed to send command to ${ip}: ${response.status} ${response.statusText}`
        );
      }
      setErrorMessage(null); // Clear any previous error message
      console.log(response);
      try {
        // Try catch block here to catch the errors in JSON parsing (since when testing the app is responding with HTML)
        const responseData = await response.json();
        console.log("Response data:", responseData);
      } catch (error: any) {}
    } catch (error: any) {
      console.error("Command failed:", error);
      setErrorMessage(`Command failed for ${ip}: ${error.message}`);
    }
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

  // this code is here to test if the fetch function works
  useEffect(() => {
    const fetchData = async () => {
      try {
        await sendCommand("jsonplaceholder.typicode.com", "todos/1");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="container mx-auto p-4 max-w-md mt-20">
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
            className="border-2 rounded-lg p-4 border-base-content"
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

                  <p className="text-sm text-muted-foreground">{conveyor.ip}</p>

                  <p className="text-sm text-muted-foreground">Speed: 50%</p>
                  <p className="text-sm text-muted-foreground">
                    Remote Controlled
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
                >
                  <ChevronUp className="w-4 h-4 mr-2" />
                  {conveyor.isSpeedUpOn ? "Speed +" : "Speed +"}
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
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  {conveyor.isSpeedDownOn ? "Speed -" : "Speed -"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
