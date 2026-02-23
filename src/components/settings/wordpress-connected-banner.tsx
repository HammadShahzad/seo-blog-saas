import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";

interface WordPressConnectedBannerProps {
  connectedUrl: string;
  connectedMode: "app-password" | "plugin" | null;
  isDisconnecting: boolean;
  onDisconnect: () => void;
}

export function WordPressConnectedBanner({
  connectedUrl,
  connectedMode,
  isDisconnecting,
  onDisconnect,
}: WordPressConnectedBannerProps) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">WordPress Connected</p>
            <p className="text-sm text-green-700">
              {connectedUrl}
              {connectedMode && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                  {connectedMode === "plugin"
                    ? "Plugin method"
                    : "App Password"}
                </span>
              )}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-green-300 text-green-800"
          onClick={onDisconnect}
          disabled={isDisconnecting}
        >
          {isDisconnecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Disconnect"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
