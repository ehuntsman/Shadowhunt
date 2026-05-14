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
  ChevronRight,
  MapPin,
  CheckCircle2,
  Package,
  Search,
  Activity
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
      <SafeAreaView className="flex-1 items-center justify-center bg-[#fbfbfb]">
        <Spinner size="large" />
      </SafeAreaView>
    );
  }

  if (!gameState) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-8 bg-slate-950">
        <View className="items-center">
          <View className="w-20 h-20 bg-slate-800 rounded-full items-center justify-center mb-8 shadow-2xl">
             <ShieldAlert size={40} className="text-white" />
          </View>
          <Text variant="h1" className="mb-4 text-center font-serif text-5xl text-white tracking-tighter">SHADOWHUNT</Text>
          <Text variant="p" className="mb-12 text-center text-slate-400 italic font-light max-w-xs leading-relaxed">
            An episodic narrative investigation. Every choice leaves a mark on your soul.
          </Text>
          <Button size="lg" onPress={() => initializeGame()} className="rounded-xl px-12 bg-white active:bg-slate-200">
            <Text className="text-slate-950 font-bold tracking-widest uppercase text-xs">Begin Operation</Text>
          </Button>
        </View>
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
      Alert.alert("Requirement Not Met", e instanceof Error ? e.message : "You cannot take this action.");
    } finally {
      setLoading(false);
    }
  };

  const Meter = ({ icon: Icon, value, color, label }: { icon: any, value: number, color: string, label: string }) => (
    <View className="items-center flex-1">
      <Icon size={14} color={color} />
      <Text className="text-[10px] mt-1 font-bold" style={{ color }}>{value}</Text>
    </View>
  );

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case "High": return "text-red-500 bg-red-50 border-red-100";
      case "Medium": return "text-amber-600 bg-amber-50 border-amber-100";
      case "Low": return "text-emerald-600 bg-emerald-50 border-emerald-100";
      default: return "text-slate-400 bg-slate-50 border-slate-100";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#fbfbfb]" edges={["top"]}>
      {/* Compact Stats Header */}
      <View className="flex-row justify-between px-4 py-3 border-b border-slate-100 bg-white shadow-sm z-10">
        <Meter icon={Users} value={gameState.trust} color="#3b82f6" label="T" />
        <Meter icon={Star} value={gameState.reputation} color="#eab308" label="R" />
        <Meter icon={Zap} value={gameState.stress} color="#a855f7" label="S" />
        <Meter icon={Coins} value={gameState.money} color="#22c55e" label="M" />
        <Meter icon={AlertCircle} value={gameState.injury} color="#ef4444" label="I" />
        <Meter icon={ShieldAlert} value={gameState.authority} color="#64748b" label="A" />
        <Meter icon={BookOpen} value={gameState.knowledge} color="#6366f1" label="K" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-6 pb-12">
        {currentScene ? (
          <View className="flex-1">
            <View className="flex-row items-center mb-6">
               <MapPin size={12} className="text-slate-400 mr-1" />
               <Text className="text-slate-400 uppercase tracking-[2px] text-[10px] font-bold">
                 {currentScene.location} • Day {gameState.day}
               </Text>
            </View>
            
            <Card className="mb-6 border-none bg-white shadow-xl rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                 <Text variant="h2" className="font-serif text-3xl mb-4 leading-tight text-slate-900">
                   {currentScene.title}
                 </Text>
                 <View className="h-0.5 w-12 bg-slate-900/10 mb-6" />
                 <Text className="text-lg leading-relaxed text-slate-700 font-serif mb-6">
                   {currentScene.text}
                 </Text>

                 {/* Last Outcome Toast-like indicator */}
                 {gameState.latestOutcome && (
                    <View className="flex-row items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <Activity size={14} className="text-slate-400 mr-3" />
                        <Text className="text-[11px] text-slate-500 font-medium italic flex-1">
                           Last Result: <Text className="text-slate-800 not-italic font-bold">{gameState.latestOutcome}</Text>
                        </Text>
                    </View>
                 )}
              </CardContent>
            </Card>

            <View className="gap-3">
               {currentScene.choices.map((choice: any, i: number) => (
                 <Button 
                   key={i} 
                   variant="outline" 
                   onPress={() => handleChoice(i)}
                   className="justify-between h-auto py-5 px-6 border-slate-200 bg-white active:bg-slate-50 rounded-2xl shadow-sm"
                   disabled={loading}
                 >
                   <View className="flex-1 mr-4">
                     <View className="flex-row items-center mb-2">
                        {choice.risk && (
                          <View className={`px-2 py-0.5 rounded-full border ${getRiskColor(choice.risk)} mr-2`}>
                             <Text className="text-[9px] font-bold uppercase tracking-tighter">{choice.risk} Risk</Text>
                          </View>
                        )}
                        {/* Display Potential Outcomes directly on the button */}
                        <View className="flex-row items-center">
                           {choice.effects.money < 0 && <Coins size={12} className="text-emerald-600 mr-1" />}
                           {choice.effects.injury > 0 && <AlertCircle size={12} className="text-red-500 mr-1" />}
                           {choice.effects.stress > 0 && <Zap size={12} className="text-purple-500 mr-1" />}
                           {choice.effects.knowledge > 0 && <BookOpen size={12} className="text-blue-500 mr-1" />}
                           {(choice.itemGained || choice.clueGained) && <Search size={12} className="text-amber-500" />}
                        </View>
                     </View>
                     <Text className="text-slate-800 text-left font-medium leading-tight">{choice.text}</Text>
                   </View>
                   <ChevronRight size={18} className="text-slate-300" />
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
        <View className="absolute inset-0 bg-slate-950 items-center justify-center p-8 z-50">
          <ShieldAlert size={60} className="text-red-500 mb-6" />
          <Text variant="h1" className="mb-2 text-white font-serif text-4xl text-center tracking-tighter">OPERATION COMPROMISED</Text>
          <Text variant="p" className="text-center mb-12 text-slate-400 font-light max-w-xs leading-relaxed">
            {gameState.stress >= 100 
              ? "Mental breakdown. You've lost your grip on reality." 
              : "Critical injuries sustained. You were found unresponsive."}
          </Text>
          <Button onPress={() => initializeGame()} className="rounded-xl px-12 bg-white active:bg-slate-200">
            <RefreshCw size={16} className="mr-2 text-slate-950" />
            <Text className="text-slate-950 font-bold tracking-widest uppercase text-xs">Restart Case</Text>
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}
