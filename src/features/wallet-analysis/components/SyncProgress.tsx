"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SyncProgressProps {
  stage: "fetching" | "pricing" | "classifying" | "complete" | "error";
  message: string;
}

export function SyncProgress({ stage, message }: SyncProgressProps) {
  const stages = ["fetching", "pricing", "classifying", "complete"];
  const currentIndex = stages.indexOf(stage);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-2">
        <div className="text-sm font-medium">Processing Wallet</div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress steps */}
          <div className="flex items-center gap-2">
            {stages.slice(0, 3).map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i < currentIndex
                      ? "bg-green-500 text-white"
                      : i === currentIndex
                      ? "bg-blue-500 text-white animate-pulse"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i < currentIndex ? "✓" : i + 1}
                </div>
                {i < 2 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      i < currentIndex ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Stage labels */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Auditor</span>
            <span>Appraiser</span>
            <span>Accountant</span>
          </div>

          {/* Current message */}
          <div className="text-sm text-center py-2">{message}</div>

          {/* Loading skeletons */}
          {stage !== "complete" && stage !== "error" && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
