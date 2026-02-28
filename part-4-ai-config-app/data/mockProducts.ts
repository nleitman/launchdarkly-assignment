import type { Product } from "./products";
  
  export const productsAvailable: Product[] = [
    {
      name: "PulseTrack Vital Monitor",
      productId: "13",
      description: "Fitness tracker with heart rate monitoring",
      type: "fitness",
      price: 99,
      preferenceTags: ["fitness", "health", "monitoring", "budget"],
    },
    {
      name: "RaceTracker Pro GPS Elite",
      productId: "19",
      description: "Advanced GPS watch for runners",
      type: "fitness",
      price: 199,
      preferenceTags: ["running", "gps", "performance"],
    },
    {
      name: "FitCore Active Band",
      productId: "27",
      description: "Lightweight activity tracker with 7-day battery life",
      type: "fitness",
      price: 129,
      preferenceTags: ["battery", "sleep", "health"],
    },
    {
      name: "UrbanFit Smart Tracker",
      productId: "33",
      description: "Stylish tracker with step and calorie monitoring",
      type: "fitness",
      price: 89,
      preferenceTags: ["budget", "casual", "monitoring"],
    },
  ];