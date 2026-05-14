import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { View, Text, Button, SafeAreaView, Spinner, ScrollView, Card, CardContent } from "@/components/ui";
import { 
  Users, 
  Star, 
  Zap, 
  Coins, 
  AlertCircle, 
  ShieldAlert, 
  BookOpen, 
  RefreshCw,
  ChevronRight,
  MapPin,
  Search,
  Activity,
  Compass,
  Eye,
  Target
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
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-950">
        <Spinner size="large" />
      </SafeAreaView>
    );
  }

  if (!gameState) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-8 bg-slate-950">
        <View className="items-center">
          <View className="w-20 h-20 bg-slate-800 rounded-full items-center justify-center mb-8 shadow-2xl border border-slate-700">
             <ShieldAlert size={40} className="text-white" />
          </View>
          <Text variant="h1" className="mb-4 text-center font-serif text-5xl text-white tracking-tighter text-shadow-lg">SHADOWHUNT</Text>
          <Text variant="p" className="mb-12 text-center text-slate-400 italic font-light max-w-xs leading-relaxed">
            Episodic Narrative Investigation.
          </Text>
          <Button size="lg" onPress={() => initializeGame()} className="rounded-xl px-12 bg-white active:bg-slate-200">
            <Text className="text-slate-950 font-bold tracking-widest uppercase text-xs">Begin Case</Text>
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
      Alert.alert("Locked", e instanceof Error ? e.message : "Requirement not met.");
    } finally {
      setLoading(false);
    }
  };

  const Meter = ({ icon: Icon, value, color }: { icon: any, value: any, color: string }) => (
    <View className="items-center flex-1">
      <Icon size={12} color={color} />
      <Text className="text-[9px] mt-1 font-bold" style={{ color }}>{value}</Text>
    </View>
  );

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case "High": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "Medium": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "Low": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      default: return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950" edges={["top"]}>
      {/* Narrative Stats Header */}
      <View className="flex-row justify-between px-4 py-3 border-b border-white/5 bg-slate-900/80 z-10">
        <Meter icon={Users} value={gameState.trust} color="#3b82f6" />
        <Meter icon={Zap} value={gameState.stress} color="#a855f7" />
        <Meter icon={Coins} value={gameState.money} color="#22c55e" />
        <Meter icon={AlertCircle} value={gameState.injury} color="#ef4444" />
        {/* Hunt Progress Meter */}
        <View className="items-center flex-[2] bg-slate-800/50 rounded-lg px-2 py-1 mx-2 border border-white/5">
            <View className="flex-row items-center mb-1">
                <Target size={10} className="text-amber-500 mr-1" />
                <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Hunt Progress</Text>
            </View>
            <View className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                <View className="h-full bg-amber-500 shadow-[0_0_5px_#f59e0b]" style={{ width: `${gameState.knowledge}%` }} />
            </View>
        </View>
        <Meter icon={Star} value={gameState.reputation} color="#eab308" />
        <Meter icon={ShieldAlert} value={gameState.authority} color="#64748b" />
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-6 pb-20">
        <View className="flex-row items-center mb-6">
            <MapPin size={12} className="text-slate-500 mr-1" />
            <Text className="text-slate-500 uppercase tracking-[2px] text-[10px] font-bold">
                {currentScene.location} • Day {gameState.day}
            </Text>
        </View>

        <Card className="mb-8 border border-white/10 bg-slate-900 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
                <Text variant="h2" className="font-serif text-3xl mb-4 leading-tight text-white">
                {currentScene.title}
                </Text>
                <View className="h-0.5 w-12 bg-white/10 mb-6" />
                <Text className="text-lg leading-relaxed text-slate-300 font-serif mb-8">
                {currentScene.text}
                </Text>

                {gameState.latestOutcome && (
                <View className="flex-row items-center bg-white/5 p-4 rounded-xl border border-white/5">
                    <Activity size={14} className="text-slate-500 mr-3" />
                    <Text className="text-[11px] text-slate-400 font-medium italic flex-1">
                        Outcome: <Text className="text-white not-italic font-bold">{gameState.latestOutcome}</Text>
                    </Text>
                </View>
                )}
            </CardContent>
        </Card>

        {/* Investigate Section */}
        <View className="mb-8">
            <View className="flex-row items-center mb-4 ml-2">
                <Eye size={14} className="text-slate-500 mr-2" />
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Investigation</Text>
            </View>
            <View className="gap-3">
            {currentScene.choices.map((choice: any, i: number) => {
                if (choice.nextSceneId !== currentScene.sceneId && choice.nextSceneId !== "the_encounter" && choice.nextSceneId !== "victory") return null;
                return (
                <Button 
                    key={i} 
                    variant="outline" 
                    onPress={() => handleChoice(i)}
                    className="justify-between h-auto py-5 px-6 border-white/10 bg-slate-900 active:bg-slate-800 rounded-2xl"
                    disabled={loading}
                >
                    <View className="flex-1 mr-4">
                        <View className="flex-row items-center mb-2">
                            {choice.risk && (
                                <View className={`px-2 py-0.5 rounded-full border ${getRiskColor(choice.risk)} mr-2`}>
                                    <Text className="text-[9px] font-bold uppercase tracking-tighter">{choice.risk}</Text>
                                </View>
                            )}
                            <View className="flex-row items-center">
                                {choice.effects.money < 0 && <Coins size={12} className="text-emerald-500 mr-1.5" />}
                                {choice.effects.injury > 0 && <AlertCircle size={12} className="text-red-500 mr-1.5" />}
                                {choice.effects.knowledge > 0 && <BookOpen size={12} className="text-blue-500 mr-1.5" />}
                                {(choice.itemGained || choice.clueGained) && <Search size={12} className="text-amber-400" />}
                            </View>
                        </View>
                        <Text className="text-white text-left font-medium leading-tight">{choice.text}</Text>
                    </View>
                    <ChevronRight size={18} className="text-slate-700" />
                </Button>
                );
            })}
            </View>
        </View>

        {/* Travel Section */}
        <View>
            <View className="flex-row items-center mb-4 ml-2">
                <Compass size={14} className="text-slate-500 mr-2" />
                <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Travel</Text>
            </View>
            <View className="gap-3">
            {currentScene.choices.map((choice: any, i: number) => {
                if (choice.nextSceneId === currentScene.sceneId || choice.nextSceneId === "the_encounter" || choice.nextSceneId === "victory") return null;
                return (
                <Button 
                    key={i} 
                    onPress={() => handleChoice(i)}
                    className="justify-between h-auto py-5 px-6 bg-slate-100 active:bg-slate-200 rounded-2xl"
                    disabled={loading}
                >
                    <Text className="flex-1 text-slate-950 text-left font-bold tracking-tight">{choice.text}</Text>
                    <ChevronRight size={18} className="text-slate-950" />
                </Button>
                );
            })}
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
