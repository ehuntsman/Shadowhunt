import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { View, Text, Button, SafeAreaView, Spinner, ScrollView, Card, CardContent, Badge } from "@/components/ui";
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
  AlertTriangle
} from "lucide-react-native";
import { Alert } from "react-native";

export default function InvestigationScreen() {
  const gameState = useQuery(api.game.getGameState);
  const currentScene = useQuery(api.game.getCurrentScene);
  const initializeGame = useMutation(api.game.initializeGame);
  const makeChoice = useMutation(api.game.makeChoice);
  const confirmAction = useMutation(api.game.confirmAction);
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
      <Icon size={16} color={color} />
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
      {/* Narrative Stats Header */}
      <View className="flex-row justify-between px-4 py-4 border-b border-slate-100 bg-white shadow-sm z-10">
        <Meter icon={Users} value={gameState.trust} color="#3b82f6" label="Trust" />
        <Meter icon={Star} value={gameState.reputation} color="#eab308" label="Rep" />
        <Meter icon={Zap} value={gameState.stress} color="#a855f7" label="Stress" />
        <Meter icon={Coins} value={gameState.money} color="#22c55e" label="Money" />
        <Meter icon={AlertCircle} value={gameState.injury} color="#ef4444" label="Injury" />
        <Meter icon={ShieldAlert} value={gameState.authority} color="#64748b" label="Auth" />
        <Meter icon={BookOpen} value={gameState.knowledge} color="#6366f1" label="Know" />
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
            
            <Card className="mb-8 border-none bg-white shadow-xl rounded-3xl overflow-hidden min-h-[200px]">
              <CardContent className="p-8">
                 <Text variant="h2" className="font-serif text-3xl mb-6 leading-tight text-slate-900">
                   {currentScene.title}
                 </Text>
                 <View className="h-0.5 w-12 bg-slate-900/10 mb-8" />
                 <Text className="text-lg leading-relaxed text-slate-700 font-serif">
                   {currentScene.text}
                 </Text>
              </CardContent>
            </Card>

            <View className="gap-3">
               {!gameState.lastAction ? (
                 currentScene.choices.map((choice: any, i: number) => {
                   const cost = choice.effects.money;
                   return (
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
                           {cost && (
                              <View className="px-2 py-0.5 rounded-full border border-emerald-100 bg-emerald-50">
                                 <Text className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">Cost: ${Math.abs(cost)}</Text>
                              </View>
                           )}
                        </View>
                        <Text className="text-slate-800 text-left font-medium leading-tight">{choice.text}</Text>
                      </View>
                      <ChevronRight size={18} className="text-slate-300" />
                    </Button>
                   );
                 })
               ) : (
                 <View className="bg-slate-900 p-8 rounded-3xl shadow-xl">
                    <View className="items-center mb-6">
                        <CheckCircle2 size={40} className="text-white mb-4" />
                        <Text className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">Action Outcome</Text>
                        <Text className="text-xl font-serif text-center text-white italic">"{gameState.lastAction.text}"</Text>
                    </View>
                    
                    <View className="bg-white/10 p-5 rounded-2xl w-full mb-8 border border-white/5">
                        <Text className="text-white text-center font-medium mb-4">{gameState.lastAction.resultText}</Text>
                        
                        {gameState.lastAction.itemGained && (
                          <View className="flex-row items-center justify-center mb-2">
                             <Package size={14} className="text-blue-400 mr-2" />
                             <Text className="text-blue-400 text-sm font-bold">Acquired: {gameState.lastAction.itemGained}</Text>
                          </View>
                        )}

                        {gameState.lastAction.clueGained && (
                          <View className="flex-row items-center justify-center">
                             <Search size={14} className="text-amber-400 mr-2" />
                             <Text className="text-amber-400 text-sm font-bold italic">New Lead: {gameState.lastAction.clueGained}</Text>
                          </View>
                        )}
                    </View>

                    <Button onPress={() => confirmAction()} className="w-full h-14 rounded-2xl bg-white active:bg-slate-200">
                        <Text className="text-slate-950 font-bold tracking-widest uppercase text-xs">Continue</Text>
                    </Button>
                 </View>
               )}
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
              ? "Mental breakdown. You've lost your grip on reality. The investigation is terminated." 
              : "Critical injuries sustained. You were found unresponsive at the scene."}
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
