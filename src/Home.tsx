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
}

export default function Home() {
  const [conveyors, setConveyors] = useState<ConveyorControl[]>([]);
  const [newIp, setNewIp] = useState("");
  const [newName, setNewName] = useState("");

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
      if (!response.ok) throw new Error("Failed to send command");
      // Add visual feedback here if needed
    } catch (error) {
      console.error("Error sending command:", error);
      // Add error handling UI here if needed
    }
  };

  return (
    <main className="container mx-auto p-4 max-w-md">
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
                <div>
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
                  className="w-full btn bg-base-content text-base-300"
                  onClick={() => sendCommand(conveyor.ip, "conveyorOn")}
                >
                  <Power className="w-4 h-4 mr-2" />
                  ON
                </button>
                <button
                  className="w-full btn bg-base-content text-base-300"
                  onClick={() => sendCommand(conveyor.ip, "speedUp")}
                >
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Speed +
                </button>
                <button
                  className="w-full btn bg-base-content text-base-300"
                  onClick={() => sendCommand(conveyor.ip, "speedDown")}
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Speed -
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
