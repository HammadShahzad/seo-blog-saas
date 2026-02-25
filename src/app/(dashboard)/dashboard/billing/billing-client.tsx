"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Loader2,
  CreditCard,
  Globe,
  FileText,
  Image,
  Users,
  Check,
  X,
  Crown,
} from "lucide-react";

interface UpgradeButtonProps {
  planKey: string;
  billing: "monthly" | "annual";
  isUpgrade: boolean;
}

export function UpgradeButton({ planKey, billing, isUpgrade }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey, billing }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      className="w-full"
      variant={isUpgrade ? "default" : "outline"}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isUpgrade ? (
        <>
          Upgrade
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      ) : (
        "Downgrade"
      )}
    </Button>
  );
}

export function ManageButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to open billing portal");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Portal error:", err);
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Manage Subscription
        </>
      )}
    </Button>
  );
}

interface PlanInfo {
  name: string;
  price: number;
  annualPrice: number;
  planKey: string;
  features: {
    maxWebsites: number;
    maxPostsPerMonth: number;
    maxImagesPerMonth: number;
    apiAccess: boolean;
    cmsPush: boolean;
    socialPublishing: boolean;
    teamMembers: number;
  };
}

interface BillingPlansSectionProps {
  plans: PlanInfo[];
  currentPlan: string;
}

export function BillingPlansSection({ plans, currentPlan }: BillingPlansSectionProps) {
  const [annual, setAnnual] = useState(false);
  const planOrder = ["FREE", "STARTER", "GROWTH", "AGENCY"];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Available Plans</h3>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${annual ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${annual ? "translate-x-6" : "translate-x-1"}`} />
          </button>
          <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>Annual</span>
          {annual && (
            <Badge variant="secondary" className="text-emerald-600 bg-emerald-50 border-emerald-200">Save 20%</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map(({ planKey, name, price, annualPrice, features }) => {
          const isCurrent = currentPlan === planKey;
          const isPopular = planKey === "GROWTH";
          const displayPrice = annual && annualPrice > 0 ? annualPrice : price;

          return (
            <Card
              key={planKey}
              className={`relative ${isPopular ? "border-primary shadow-lg" : ""} ${isCurrent ? "ring-2 ring-primary" : ""}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {planKey === "AGENCY" && <Crown className="h-5 w-5 text-yellow-500" />}
                  {name}
                </CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">${displayPrice}</span>
                  {displayPrice > 0 && (
                    <span className="text-muted-foreground">/mo</span>
                  )}
                  {annual && displayPrice > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">Billed annually (${displayPrice * 12}/yr)</p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4" />
                  <span>{features.maxWebsites} website{features.maxWebsites !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>{features.maxPostsPerMonth} posts/month</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Image className="h-4 w-4" />
                  <span>{features.maxImagesPerMonth} AI images/month</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${!features.apiAccess ? "text-muted-foreground" : ""}`}>
                  {features.apiAccess ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-muted-foreground" />}
                  <span>API Access</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${!features.cmsPush ? "text-muted-foreground" : ""}`}>
                  {features.cmsPush ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-muted-foreground" />}
                  <span>CMS Push</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${!features.socialPublishing ? "text-muted-foreground" : ""}`}>
                  {features.socialPublishing ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-muted-foreground" />}
                  <span>Social Publishing</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{features.teamMembers === -1 ? "Unlimited" : features.teamMembers} team member{features.teamMembers !== 1 ? "s" : ""}</span>
                </div>
              </CardContent>
              <CardFooter>
                {isCurrent ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : planKey === "FREE" ? (
                  <ManageButton />
                ) : (
                  <UpgradeButton
                    planKey={planKey}
                    billing={annual ? "annual" : "monthly"}
                    isUpgrade={planOrder.indexOf(planKey) > planOrder.indexOf(currentPlan)}
                  />
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
