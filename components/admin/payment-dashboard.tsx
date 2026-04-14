"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import {
  CreditCard,
  Settings2,
  CheckCircle,
  Loader2,
  DollarSign,
  Activity,
  ToggleLeft,
} from "lucide-react";
import { GatewayConfigModal } from "./gateway-config-modal";
import { PendingPayments } from "./pending-payments";

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
  id: string;
  code: string;
  name: string;
  displayName: string | null;
  description: string | null;
  logo: string | null;
  category: string;
  supportedCountries: string[];
  supportedCurrencies: string[];
  credentials: Record<string, string>;
  feePercent: number;
  feeFixed: number;
  isActive: boolean;
  isAvailable: boolean;
  environment: string;
  displayOrder: number;
  credentialFields: CredentialField[];
}

const gatewayLogos: Record<string, string> = {
  whatsapp_manual: "/icons/whatsapp.svg",
  pesapal: "/icons/pesapal.svg",
  paypal: "/icons/paypal.svg",
  stripe: "/icons/stripe.svg",
  flutterwave: "/icons/flutterwave.svg",
  mpesa: "/icons/mpesa.svg",
  mtn_momo: "/icons/mtn-momo.svg",
  dpo: "/icons/dpo.svg",
  coinbase: "/icons/coinbase.svg",
  bank_transfer: "/icons/bank-transfer.svg",
};

const categoryLabels: Record<string, string> = {
  all: "All",
  manual: "Manual",
  mobile_money: "Mobile Money",
  card_mobile: "Card & Mobile",
  international_card: "International Cards",
  international_wallet: "Wallets",
  cryptocurrency: "Cryptocurrency",
  bank_transfer: "Bank Transfer",
};

export function PaymentDashboard() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const fetchGateways = useCallback(async () => {
    try {
      const res = await axios.get("/api/admin/gateways");
      setGateways(res.data);
    } catch {
      toast.error("Failed to load gateways");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);

  const handleToggle = async (gateway: Gateway) => {
    setToggling(gateway.code);
    try {
      if (gateway.isActive) {
        await axios.post(`/api/admin/gateways/${gateway.code}/deactivate`);
        toast.success(`${gateway.name} deactivated`);
      } else {
        // Check if credentials exist
        const hasCredentials = Object.keys(gateway.credentials).length > 0;
        if (!hasCredentials) {
          setSelectedGateway(gateway);
          setShowConfig(true);
          setToggling(null);
          return;
        }
        await axios.post(`/api/admin/gateways/${gateway.code}/activate`, { credentials: { environment: gateway.environment }, environment: gateway.environment });
        toast.success(`${gateway.name} activated`);
      }
      await fetchGateways();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to toggle gateway");
    } finally {
      setToggling(null);
    }
  };

  const activeCount = gateways.filter((g) => g.isActive).length;
  const inactiveCount = gateways.filter((g) => !g.isActive).length;

  const filtered = activeTab === "all"
    ? gateways
    : gateways.filter((g) => g.category === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active Gateways</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <ToggleLeft className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inactiveCount}</p>
              <p className="text-xs text-muted-foreground">Inactive</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{gateways.length}</p>
              <p className="text-xs text-muted-foreground">Total Gateways</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{gateways.filter(g => g.environment === "live").length}</p>
              <p className="text-xs text-muted-foreground">Live Mode</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="text-xs px-3 py-1.5">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((gateway) => (
              <Card
                key={gateway.code}
                className={`transition-all ${gateway.isActive ? "border-green-200 dark:border-green-800" : ""}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg overflow-hidden shrink-0">
                        {gatewayLogos[gateway.code] ? (
                          <Image
                            src={gatewayLogos[gateway.code]}
                            alt={gateway.name}
                            width={40}
                            height={40}
                            className="rounded-lg"
                          />
                        ) : (
                          <div className={`p-2.5 rounded-lg ${gateway.isActive ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-gray-800"}`}>
                            <CreditCard className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{gateway.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{gateway.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={gateway.isActive}
                      onCheckedChange={() => handleToggle(gateway)}
                      disabled={toggling === gateway.code}
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {gateway.supportedCurrencies.slice(0, 4).map((c) => (
                      <Badge key={c} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {c}
                      </Badge>
                    ))}
                    {gateway.supportedCurrencies.length > 4 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        +{gateway.supportedCurrencies.length - 4}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`text-[10px] ${
                          gateway.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-100 border-0"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-100 border-0"
                        }`}
                      >
                        {gateway.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge
                        className={`text-[10px] ${
                          gateway.environment === "live"
                            ? "bg-red-100 text-red-700 hover:bg-red-100 border-0"
                            : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0"
                        }`}
                      >
                        {gateway.environment === "live" ? "Live" : "Sandbox"}
                      </Badge>
                      {gateway.feePercent > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          Fee: {gateway.feePercent}%{gateway.feeFixed > 0 ? ` + $${gateway.feeFixed}` : ""}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setSelectedGateway(gateway);
                        setShowConfig(true);
                      }}
                    >
                      <Settings2 className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Pending Manual Payments Section */}
      <Separator />
      <PendingPayments />

      {/* Config Modal */}
      {showConfig && selectedGateway && (
        <GatewayConfigModal
          gateway={selectedGateway}
          onClose={() => {
            setShowConfig(false);
            setSelectedGateway(null);
          }}
          onSaved={() => {
            fetchGateways();
            setShowConfig(false);
            setSelectedGateway(null);
          }}
        />
      )}
    </div>
  );
}
