"use client";
import View from "@/app/_pages/error";
export default function ErrorBoundary(props: {
  error: Error;
  reset: () => void;
}) {
  return <View {...props} locale="mn" />;
}
