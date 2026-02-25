import { getCurrentOrganization } from "@/lib/get-session";
import { PLANS } from "@/lib/stripe";

export const dynamic = "force-dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, FileText, Image, Zap } from "lucide-react";
import { ManageButton, BillingPlansSection } from "./billing-client";

export default async function BillingPage() {
  const { organization } = await getCurrentOrganization();
  const subscription = organization.subscription;
  const currentPlan = subscription?.plan || "FREE";

  const planOrder = ["FREE", "STARTER", "GROWTH", "AGENCY"] as const;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Billing</h2>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing
        </p>
      </div>

      {/* Current Plan Summary */}
      {subscription && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  Your active subscription details
                </CardDescription>
              </div>
              <Badge className="text-sm px-3 py-1">
                {PLANS[currentPlan as keyof typeof PLANS]?.name || currentPlan}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Globe className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">
                  {subscription.websitesUsed}/{subscription.maxWebsites}
                </p>
                <p className="text-sm text-muted-foreground">Websites</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <FileText className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">
                  {subscription.postsGeneratedThisMonth}/{subscription.maxPostsPerMonth}
                </p>
                <p className="text-sm text-muted-foreground">Posts this month</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Image className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">
                  {subscription.imagesGeneratedThisMonth}/{subscription.maxImagesPerMonth}
                </p>
                <p className="text-sm text-muted-foreground">Images this month</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Zap className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold capitalize">
                  {subscription.status.toLowerCase()}
                </p>
                <p className="text-sm text-muted-foreground">Status</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <ManageButton />
          </CardFooter>
        </Card>
      )}

      {/* Pricing Plans */}
      <BillingPlansSection
        currentPlan={currentPlan}
        plans={planOrder.map((planKey) => {
          const plan = PLANS[planKey];
          const annualPrices: Record<string, number> = {
            STARTER: 23, GROWTH: 63, AGENCY: 159,
          };
          return {
            planKey,
            name: plan.name,
            price: plan.price,
            annualPrice: annualPrices[planKey] ?? 0,
            features: {
              maxWebsites: plan.features.maxWebsites,
              maxPostsPerMonth: plan.features.maxPostsPerMonth,
              maxImagesPerMonth: plan.features.maxImagesPerMonth,
              apiAccess: plan.features.apiAccess,
              cmsPush: Boolean(plan.features.cmsPush),
              socialPublishing: Boolean(plan.features.socialPublishing),
              teamMembers: plan.features.teamMembers,
            },
          };
        })}
      />
    </div>
  );
}
