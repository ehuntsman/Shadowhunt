import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { View, Text, Button, SafeAreaView, Spinner } from "@/components/ui";
import { GameCard } from "@/components/GameCard";
import { Heart, Brain, Coins, Ghost, RefreshCw } from "lucide-react-native";
import { Id } from "@/convex/_generated/dataModel";
import { Alert } from "react-native";

export default function HomeScreen() {
  const gameState = useQuery(api.game.getGameState);
  const encounter = useQuery(api.game.getRandomEncounter);
  const initializeGame = useMutation(api.game.initializeGame);
  const handleChoice = useMutation(api.game.handleChoice);

  console.log("Game state:", gameState);
  console.log("Encounter:", encounter);

  if (gameState === undefined) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Spinner size="large" />
        <Text className="mt-4 text-muted-foreground">Connecting to backend...</Text>
        <Text variant="small" className="mt-2 text-muted-foreground/50">
          {process.env.EXPO_PUBLIC_CONVEX_URL}
        </Text>
      </SafeAreaView>
    );
  }

  if (!gameState) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-6">
        <Text variant="h1" className="mb-4 text-center font-bold">Shadow Hunter</Text>
        <Text variant="p" className="mb-8 text-center text-muted-foreground">
          Welcome to the bunker. The supernatural is real, and it's your job to hunt it. 
          Manage your resources and keep your sanity.
        </Text>
        <Button size="lg" onPress={() => initializeGame()}>
          <Text>Begin the Hunt</Text>
        </Button>
      </SafeAreaView>
    );
  }

  const onSwipe = async (choice: "left" | "right") => {
    if (encounter) {
      try {
        await handleChoice({ 
          choice, 
          encounterId: encounter._id 
        });
      } catch (e) {
        Alert.alert("Missing Item", e instanceof Error ? e.message : "You can't do that yet.");
      }
    }
  };

  const Meter = ({ icon: Icon, value, color }: { icon: any, value: number, color: string }) => (
    <View className="items-center flex-1">
      <Icon size={24} color={color} />
      <View className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
        <View 
          className="h-full" 
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }} 
        />
      </View>
    </View>
  );

  const isGameOver = gameState.health <= 0 || gameState.sanity <= 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Stats Header */}
      <View className="flex-row justify-between px-6 py-4 border-b border-border bg-card/50">
        <Meter icon={Heart} value={gameState.health} color="#ef4444" />
        <View className="w-4" />
        <Meter icon={Brain} value={gameState.sanity} color="#a855f7" />
        <View className="w-4" />
        <Meter icon={Coins} value={gameState.resources} color="#eab308" />
        <View className="w-4" />
        <Meter icon={Ghost} value={gameState.shadow} color="#64748b" />
      </View>

      <View className="flex-1">
        <View className="px-6 pt-4">
           <Text variant="small" className="text-muted-foreground uppercase font-bold tracking-widest">
             Day {gameState.day} • {gameState.location}
           </Text>
        </View>

        {encounter ? (
          <GameCard
            key={encounter._id} 
            text={encounter.text}
            leftText={encounter.leftOption.text}
            rightText={encounter.rightOption.text}
            leftRequiredItem={(encounter.leftOption as any).itemRequired}
            rightRequiredItem={(encounter.rightOption as any).itemRequired}
            onSwipeLeft={() => onSwipe("left")}
            onSwipeRight={() => onSwipe("right")}
          />
        ) : (
          <View className="flex-1 items-center justify-center p-6">
             <Text className="text-muted-foreground mb-4">Finding next encounter...</Text>
             <Spinner />
          </View>
        )}
      </View>

      {/* Game Over State */}
      {isGameOver && (
        <View className="absolute inset-0 bg-background/95 items-center justify-center p-8 z-50">
          <Text variant="h1" className="mb-2 text-destructive">Game Over</Text>
          <Text variant="p" className="text-center mb-8">
            {gameState.health <= 0 ? "You died from your wounds." : "You lost your mind to the shadows."}
          </Text>
          <Button onPress={() => initializeGame()}>
            <RefreshCw size={20} className="mr-2" />
            <Text>Start Over</Text>
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}
