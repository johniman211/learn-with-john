"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";

export function SendRemindersButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.post("/api/admin/send-reminders");
      toast.success(`Sent ${data.sentCount} reminder email${data.sentCount !== 1 ? "s" : ""}`);
    } catch {
      toast.error("Failed to send reminders");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSend}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mail className="h-4 w-4" />
      )}
      Send Reminders
    </Button>
  );
}
