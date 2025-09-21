"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAIInsights } from "@/actions/dashboard";
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb } from "lucide-react";

const AIInsight = ({ accountId }) => {
  const [insight, setInsight] = useState("Loading AI insights...");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInsight() {
      setIsLoading(true);
      try {
        const advice = await getAIInsights(accountId);
        setInsight(advice);
      } catch (error) {
        setInsight("Failed to load AI insights.");
      } finally {
        setIsLoading(false);
      }
    }
    if (accountId) {
      fetchInsight();
    }
  }, [accountId]);

  const formatInsight = (text) => {
    // Split the text into points and format them
    const points = text.split('\n').filter(line => line.trim());
    return points.map((point, index) => {
      const icons = [TrendingUp, Target, AlertTriangle, Lightbulb, Brain];
      const Icon = icons[index % icons.length];
      return (
        <div key={index} className="flex items-start gap-3 mb-3 last:mb-0">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
            <Icon className="w-3 h-3 text-blue-600" />
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{point.trim()}</p>
        </div>
      );
    });
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-blue-900">
          <Brain className="w-5 h-5 text-blue-600" />
          AI Financial Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-blue-600">Analyzing your finances...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {formatInsight(insight)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsight;
