import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./client/src/lib/queryClient";

function MinimalApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            ParkSys Test
          </h1>
          <p className="text-gray-600">
            Minimal test app to verify functionality
          </p>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default MinimalApp;