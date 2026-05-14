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
  Search
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
            
            <Card className="mb-8 border-none bg-white shadow-xl rounded-3xl overflow-hidden min-h-[300px]">
              <CardContent className="p-8">
                 <Text variant="h2" className="font-serif text-3xl mb-6 leading-tight text-slate-900">
                   {currentScene.title}
                 </Text>
                 <View className="h-0.5 w-12 bg-slate-900/10 mb-8" />
                 <Text className="text-lg leading-relaxed text-slate-700 font-serif">
                   {currentScene.text}
                 </Text>

                 {/* Action Feedback Overlay */}
                 {gameState.lastAction && (
                    <View className="absolute inset-0 bg-white/95 p-8 justify-center items-center rounded-3xl z-20">
                        <CheckCircle2 size={48} className="text-slate-900 mb-4" />
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Outcome</Text>
                        <Text className="text-xl font-serif text-center mb-6 text-slate-900">"{gameState.lastAction.text}"</Text>
                        
                        <View className="bg-slate-50 p-6 rounded-2xl w-full mb-8">
                           <Text className="text-slate-800 text-center font-medium mb-4">{gameState.lastAction.resultText}</Text>
                           
                           {gameState.lastAction.itemGained && (
                             <View className="flex-row items-center justify-center mb-2">
                                <Package size={14} className="text-blue-500 mr-2" />
                                <Text className="text-blue-500 text-sm font-bold">Acquired: {gameState.lastAction.itemGained}</Text>
                             </View>
                           )}

                           {gameState.lastAction.clueGained && (
                             <View className="flex-row items-center justify-center">
                                <Search size={14} className="text-amber-500 mr-2" />
                                <Text className="text-amber-500 text-sm font-bold italic">New Lead: {gameState.lastAction.clueGained}</Text>
                             </View>
                           )}
                        </View>

                        <Button onPress={() => confirmAction()} className="w-full h-14 rounded-2xl bg-slate-900 active:bg-slate-800">
                           <Text className="text-white font-bold tracking-widest uppercase text-xs">Continue Investigation</Text>
                        </Button>
                    </View>
                 )}
              </CardContent>
            </Card>

            <View className="gap-3">
               {currentScene.choices.map((choice, i) => (
                 <Button 
                   key={i} 
                   variant="outline" 
                   onPress={() => handleChoice(i)}
                   className="justify-between h-auto py-5 px-6 border-slate-200 bg-white active:bg-slate-50 rounded-2xl shadow-sm"
                   disabled={loading || !!gameState.lastAction}
                 >
                   <Text className="flex-1 text-slate-800 text-left font-medium mr-4 leading-tight">{choice.text}</Text>
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
