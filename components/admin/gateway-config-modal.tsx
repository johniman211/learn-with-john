"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Eye,
  EyeOff,
  X,
  AlertTriangle,
  Shield,
} from "lucide-react";

interface CredentialField {
  id: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  placeholder: string | null;
  isRequired: boolean;
  fieldOptions: string | null;
  sortOrder: number;
  helpText: string | null;
  defaultValue: string | null;
}

interface Gateway {
  code: string;
  name: string;
  displayName: string | null;
  description: string | null;
  environment: string;
  isActive: boolean;
  credentials: Record<string, string>;
  credentialFields: CredentialField[];
  feePercent: number;
  feeFixed: number;
}

interface GatewayConfigModalProps {
  gateway: Gateway;
  onClose: () => void;
  onSaved: () => void;
}

async function retryRequest<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 && i < retries) {
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Request failed");
}

export function GatewayConfigModal({ gateway, onClose, onSaved }: GatewayConfigModalProps) {
  const [displayName, setDisplayName] = useState(gateway.displayName || gateway.name);
  const [environment, setEnvironment] = useState(gateway.environment);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showFields, setShowFields] = useState<Record<string, boolean>>({});
  const [showLiveWarning, setShowLiveWarning] = useState(false);
  const [pendingEnv, setPendingEnv] = useState<string | null>(null);

  const handleFieldChange = (fieldName: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSaveAndActivate = async () => {
    setSaving(true);
    try {
      // Include environment in credentials so backend validation passes
      const allCredentials = { ...credentials, environment };

      // Save credentials
      await retryRequest(() =>
        axios.put(`/api/admin/gateways/${gateway.code}`, {
          displayName,
          environment,
          credentials: allCredentials,
        })
      );

      // Activate
      await retryRequest(() =>
        axios.post(`/api/admin/gateways/${gateway.code}/activate`, {
          credentials: allCredentials,
          environment,
        })
      );

      toast.success(`${gateway.name} configured and activated!`);
      onSaved();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const allCredentials = { ...credentials, environment };
      await retryRequest(() =>
        axios.put(`/api/admin/gateways/${gateway.code}`, {
          displayName,
          environment,
          credentials: allCredentials,
        })
      );
      toast.success("Settings saved");
      onSaved();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleEnvironmentChange = (env: string) => {
    if (env === "live" && environment === "sandbox") {
      setShowLiveWarning(true);
      setPendingEnv(env);
    } else {
      setEnvironment(env);
    }
  };

  const confirmLiveSwitch = () => {
    if (pendingEnv) setEnvironment(pendingEnv);
    setShowLiveWarning(false);
    setPendingEnv(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-semibold">Configure {gateway.name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{gateway.description}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Display Name */}
          <div>
            <label className="text-sm font-medium block mb-1.5">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What students see at checkout"
            />
            <p className="text-[11px] text-muted-foreground mt-1">This name appears on the checkout page</p>
          </div>

          {/* Environment Toggle */}
          <div>
            <label className="text-sm font-medium block mb-1.5">Environment</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleEnvironmentChange("sandbox")}
                className={`flex-1 py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                  environment === "sandbox"
                    ? "bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-400"
                    : "hover:bg-muted"
                }`}
              >
                🧪 Sandbox
              </button>
              <button
                onClick={() => handleEnvironmentChange("live")}
                className={`flex-1 py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                  environment === "live"
                    ? "bg-green-50 border-green-300 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400"
                    : "hover:bg-muted"
                }`}
              >
                🟢 Live
              </button>
            </div>
            {environment === "sandbox" && (
              <p className="text-[11px] text-yellow-600 mt-1">Test mode — no real payments will be processed</p>
            )}
            {environment === "live" && (
              <p className="text-[11px] text-green-600 mt-1 flex items-center gap-1">
                <Shield className="h-3 w-3" /> Live mode — real money will be charged
              </p>
            )}
          </div>

          {/* Live Warning Dialog */}
          {showLiveWarning && (
            <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-sm text-red-700 dark:text-red-400">Switch to Live Mode?</span>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                Real money will be charged to students. Make sure your credentials are correct and tested.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-xs"
                  onClick={confirmLiveSwitch}
                >
                  Yes, Switch to Live
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => { setShowLiveWarning(false); setPendingEnv(null); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Credential Fields */}
          <div>
            <label className="text-sm font-medium block mb-3">
              API Credentials
              <Badge variant="secondary" className="ml-2 text-[10px]">Encrypted</Badge>
            </label>
            <div className="space-y-3">
              {gateway.credentialFields
                .filter(f => f.fieldName !== "environment")
                .map((field) => (
                <div key={field.id}>
                  <label className="text-xs font-medium block mb-1">
                    {field.fieldLabel}
                    {field.isRequired && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {field.fieldType === "textarea" ? (
                    <textarea
                      rows={3}
                      placeholder={field.placeholder || ""}
                      defaultValue={gateway.credentials[field.fieldName] || field.defaultValue || ""}
                      onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  ) : field.fieldType === "select" ? (
                    <select
                      defaultValue={gateway.credentials[field.fieldName] || field.defaultValue || ""}
                      onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
                      className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {field.fieldOptions?.split(",").map((opt) => (
                        <option key={opt} value={opt.trim()}>{opt.trim()}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="relative">
                      <input
                        type={field.fieldType === "password" && !showFields[field.fieldName] ? "password" : "text"}
                        placeholder={field.placeholder || ""}
                        defaultValue={gateway.credentials[field.fieldName] || field.defaultValue || ""}
                        onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}
                        className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      {field.fieldType === "password" && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowFields((prev) => ({ ...prev, [field.fieldName]: !prev[field.fieldName] }))
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showFields[field.fieldName] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  )}
                  {field.helpText && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">{field.helpText}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-5 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Save
          </Button>
          <Button
            className="bg-[#1D6FF2] hover:bg-[#1858D0] text-white"
            onClick={handleSaveAndActivate}
            disabled={saving}
          >
            {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Save & Activate
          </Button>
        </div>
      </div>
    </div>
  );
}
