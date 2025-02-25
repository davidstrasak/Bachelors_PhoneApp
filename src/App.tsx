"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  PlusCircle,
  Trash2,
  Power,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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
          <Label htmlFor="ip">IP Address</Label>
          <Input
            id="ip"
            type="text"
            placeholder="192.168.0.207"
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name (Optional)</Label>
          <Input
            id="name"
            type="text"
            placeholder="Main Conveyor"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full"
          />
        </div>
        <Button type="submit" className="w-full">
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Conveyor
        </Button>
      </form>

      <div className="space-y-4">
        {conveyors.map((conveyor) => (
          <Card key={conveyor.id} className="bg-card">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold">{conveyor.name}</h3>
                  <p className="text-sm text-muted-foreground">{conveyor.ip}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => removeConveyor(conveyor.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  className="w-full"
                  onClick={() => sendCommand(conveyor.ip, "conveyorOn")}
                >
                  <Power className="w-4 h-4 mr-2" />
                  ON
                </Button>
                <Button
                  className="w-full"
                  onClick={() => sendCommand(conveyor.ip, "speedUp")}
                >
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Speed +
                </Button>
                <Button
                  className="w-full"
                  onClick={() => sendCommand(conveyor.ip, "speedDown")}
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Speed -
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
