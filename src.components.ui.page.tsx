"use client";

import { useState, useCallback, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addMoney, checkStatus } from "./actions";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simple email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PayoneerPage() {
  const [email, setEmail] = useState("user@example.com");
  const [amount, setAmount] = useState("100.00");
  const [ipVanish, setIpVanish] = useState(false);
  const [torGuard, setTorGuard] = useState(true);
  const [status, setStatus] = useState("Awaiting your command...");
  const [isProcessing, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAddMoney = useCallback(() => {
    // --- Enhanced Error Handling ---
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a positive amount.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      setStatus("");
      const stream = await addMoney({ email, amount, ipVanish, torGuard });
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        setStatus((prev) => prev + text); // Already includes newline from server
      }
    });
  }, [email, amount, ipVanish, torGuard, toast]);

  const handleCheckStatus = useCallback(() => {
    startTransition(async () => {
        setStatus("Pinging system services...\n");
        await sleep(500); // Give user time to see the pinging message
        const statusReport = await checkStatus({ ipVanish, torGuard });
        let newStatus = "Pinging system services...\n";
        newStatus += `API Endpoint... ${statusReport.api}\n`;
        newStatus += `Database Connection... ${statusReport.database}\n`;
        newStatus += `Transaction Ledger... ${statusReport.ledger}\n`;
        newStatus += `Security Monitor... ${statusReport.security}\n`;
        if (ipVanish) newStatus += `IP Vanish service... ${statusReport.ipVanish}\n`;
        if (torGuard) newStatus += `Tor Guard service... ${statusReport.torGuard}\n`;
        newStatus += "\nAll systems operational.";
        setStatus(newStatus);
    });
  }, [ipVanish, torGuard]);

  const handleExit = useCallback(async () => {
    startTransition(async () => {
      setStatus("Closing connections...\n");
      setEmail("");
      setAmount("");
      await sleep(500);
      setStatus((prev) => prev + "Session terminated. Goodbye.");
      await sleep(1500);
      setStatus("Awaiting your command...");
    });
  }, []);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 p-4 font-body">
      <Card className="w-full max-w-4xl shadow-2xl bg-white/80 backdrop-blur-sm border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="text-4xl font-extrabold text-gray-800 tracking-tight">Payoneer Money Adder</CardTitle>
          <CardDescription className="text-gray-600">Securely manage and transfer your funds.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-6 rounded-lg border border-gray-200 p-6 bg-white">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Your Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-gray-700">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
              <div className="space-y-4 pt-2">
                 <h3 className="text-lg font-medium text-gray-800">Privacy Settings</h3>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 bg-gray-50/50">
                  <Label htmlFor="ip-vanish" className="flex flex-col space-y-1">
                    <span className="text-gray-700">IP Vanish</span>
                    <span className="font-normal leading-snug text-gray-500">
                      Mask your IP address for enhanced privacy.
                    </span>
                  </Label>
                  <Switch
                    id="ip-vanish"
                    checked={ipVanish}
                    onCheckedChange={setIpVanish}
                    disabled={isProcessing}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 bg-gray-50/50">
                   <Label htmlFor="tor-guard" className="flex flex-col space-y-1">
                    <span className="text-gray-700">Tor Guard</span>
                     <span className="font-normal leading-snug text-gray-500">
                      Route traffic through the Tor network.
                    </span>
                  </Label>
                  <Switch
                    id="tor-guard"
                    checked={torGuard}
                    onCheckedChange={setTorGuard}
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="status" className="text-gray-700">Machine Status</Label>
              <Textarea
                id="status"
                readOnly
                value={status}
                className="flex-grow font-mono text-xs bg-gray-100/80 rounded-md p-4 h-full min-h-[300px] border-gray-200"
                rows={16}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-start gap-4 border-t border-gray-200 pt-6">
          <Button onClick={handleAddMoney} disabled={isProcessing} size="lg">
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isProcessing ? "Processing..." : "Add Money"}
          </Button>
          <Button onClick={handleCheckStatus} disabled={isProcessing} variant="secondary" size="lg">
             {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Check Status
          </Button>
          <Button onClick={handleExit} disabled={isProcessing} variant="outline" size="lg">
             {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Exit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
