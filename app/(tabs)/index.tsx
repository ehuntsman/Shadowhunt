import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { View, Text, Button, SafeAreaView, Spinner, ScrollView, Card, CardContent } from "@/components/ui";
import { 
  Users, // Trust
  Star, // Reputation
  Zap, // Stress
  Coins, // Money
  AlertCircle, // Injury
  ShieldAlert, // Authority
  BookOpen, // Knowledge
  RefreshCw,
  ChevronRight
} from "lucide-react-native";
import { Alert } from "react-native";

export default function InvestigationScreen() {
  const gameState = useQuery(api.game.getGameState);
  const currentScene = useQuery(api.game.getCurrentScene);
  const initializeGame = useMutation(api.game.initializeGame);
  const makeChoice = useMutation(api.game.makeChoice);
  const [loading, setLoading] = useState(false);

  if (gameState === undefined || (gameState && currentScene === undefined)) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Spinner size="large" />
      </SafeAreaView>
    );
  }

  if (!gameState) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-6 bg-slate-50">
        <Text variant="h1" className="mb-4 text-center font-serif text-4xl">Oakhaven</Text>
        <Text variant="p" className="mb-8 text-center text-muted-foreground italic">
          A narrative investigation into the unusual.
        </Text>
        <Button size="lg" onPress={() => initializeGame()} className="rounded-full px-8">
          <Text>Begin Case</Text>
        </Button>
      </SafeAreaView>
    );
  }

  const handleChoice = async (index: number) => {
    if (!currentScene) return;
    setLoading(true);
    try {
      await makeChoice({ 
        choiceIndex: index, 
        sceneId: currentScene.sceneId 
      });
    } catch (e) {
      Alert.alert("Locked", e instanceof Error ? e.message : "You cannot take this action.");
    } finally {
      setLoading(false);
    }
  };

  const Meter = ({ icon: Icon, value, color, label }: { icon: any, value: number, color: string, label: string }) => (
    <View className="items-center flex-1">
      <Icon size={18} color={color} />
      <Text className="text-[9px] mt-0.5 font-bold uppercase" style={{ color }}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#fbfbfb]" edges={["top"]}>
      {/* Narrative Stats Header */}
      <View className="flex-row justify-between px-4 py-3 border-b border-slate-200 bg-white shadow-sm">
        <Meter icon={Users} value={gameState.trust} color="#3b82f6" label="Trust" />
        <Meter icon={Star} value={gameState.reputation} color="#eab308" label="Rep" />
        <Meter icon={Zap} value={gameState.stress} color="#a855f7" label="Stress" />
        <Meter icon={Coins} value={gameState.money} color="#22c55e" label="Money" />
        <Meter icon={AlertCircle} value={gameState.injury} color="#ef4444" label="Injury" />
        <Meter icon={ShieldAlert} value={gameState.authority} color="#64748b" label="Auth" />
        <Meter icon={BookOpen} value={gameState.knowledge} color="#6366f1" label="Know" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-6">
        {currentScene ? (
          <View className="flex-1">
            <Text className="text-muted-foreground uppercase tracking-[3px] text-[10px] font-bold mb-2">
               {currentScene.location} • Day {gameState.day}
            </Text>
            
            <View className="mb-8">
               <Text variant="h2" className="font-serif text-3xl mb-4 leading-tight">
                 {currentScene.title}
               </Text>
               <View className="h-0.5 w-12 bg-slate-300 mb-6" />
               <Text className="text-lg leading-relaxed text-slate-700 font-light">
                 {currentScene.text}
               </Text>
            </View>

            <View className="gap-3 mb-10">
               {currentScene.choices.map((choice, i) => (
                 <Button 
                   key={i} 
                   variant="outline" 
                   onPress={() => handleChoice(i)}
                   className="justify-between h-auto py-4 px-5 border-slate-200 bg-white active:bg-slate-50"
                   disabled={loading}
                 >
                   <Text className="flex-1 text-slate-800 text-left font-medium mr-4">{choice.text}</Text>
                   <ChevronRight size={18} className="text-slate-400" />
                 </Button>
               ))}
            </View>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
             <Spinner />
          </View>
        )}
      </ScrollView>

      {/* Fail States */}
      {(gameState.stress >= 100 || gameState.injury >= 100) && (
        <View className="absolute inset-0 bg-white/95 items-center justify-center p-8 z-50">
          <Text variant="h1" className="mb-2 text-destructive font-serif">Case Closed</Text>
          <Text variant="p" className="text-center mb-8 font-light">
            {gameState.stress >= 100 ? "The mental toll was too great." : "The investigation ended in tragedy."}
          </Text>
          <Button onPress={() => initializeGame()} className="rounded-full">
            <RefreshCw size={18} className="mr-2" />
            <Text>Restart Investigation</Text>
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}
