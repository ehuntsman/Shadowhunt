import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { View, Text, SafeAreaView, ScrollView, Card, CardContent, Spinner } from "@/components/ui";
import { Book, Package, MapPin, Archive } from "lucide-react-native";
import { Badge } from "@/components/ui/badge";

export default function JournalScreen() {
  const gameState = useQuery(api.game.getGameState);

  if (gameState === undefined) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Spinner size="large" />
      </SafeAreaView>
    );
  }

  if (!gameState) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-6">
        <Text variant="h2" className="text-center font-bold">No Case Active</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#fbfbfb]" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="p-6 pb-20">
        <View className="flex-row items-center mb-8">
          <View className="bg-slate-900 p-2.5 rounded-xl mr-4 shadow-sm">
            <Book size={28} className="text-white" />
          </View>
          <View>
            <Text variant="h1" className="font-serif text-3xl">Journal</Text>
            <Text variant="small" className="text-muted-foreground font-light">Case Records & Evidence</Text>
          </View>
        </View>

        {/* Current Location Card */}
        <Card className="mb-8 border-none bg-white shadow-sm overflow-hidden">
          <View className="absolute left-0 top-0 bottom-0 w-1 bg-slate-800" />
          <CardContent className="p-5 flex-row items-center">
            <MapPin size={20} className="text-slate-500 mr-3" />
            <View>
              <Text className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Location</Text>
              <Text className="text-lg font-medium text-slate-800">{gameState.currentLocation}</Text>
            </View>
          </CardContent>
        </Card>

        {/* Clues Section */}
        <View className="mb-10">
          <View className="flex-row items-center mb-5">
             <Archive size={20} className="text-slate-800 mr-2" />
             <Text variant="h3" className="font-serif text-xl tracking-tight">Clues & Evidence</Text>
          </View>
          {gameState.clues.length > 0 ? (
            <View className="gap-3">
              {gameState.clues.map((clue, i) => (
                <View key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex-row items-start">
                   <View className="w-1.5 h-1.5 rounded-full bg-slate-800 mt-2 mr-3" />
                   <Text className="flex-1 text-slate-700 leading-snug">{clue}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text variant="small" className="text-muted-foreground italic px-2 font-light">No evidence gathered yet.</Text>
          )}
        </View>

        {/* Inventory Section */}
        <View className="mb-10">
          <View className="flex-row items-center mb-5">
             <Package size={20} className="text-slate-800 mr-2" />
             <Text variant="h3" className="font-serif text-xl tracking-tight">Field Equipment</Text>
          </View>
          {gameState.inventory.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {gameState.inventory.map((item, i) => (
                <Badge key={i} variant="secondary" className="px-4 py-2 bg-slate-100 border-slate-200">
                  <Text className="text-slate-700 font-medium">{item}</Text>
                </Badge>
              ))}
            </View>
          ) : (
            <Text variant="small" className="text-muted-foreground italic px-2 font-light">No special equipment.</Text>
          )}
        </View>

        {/* Progress Stats */}
        <View className="mt-4 pt-8 border-t border-slate-100">
           <Text variant="small" className="text-slate-400 uppercase tracking-widest text-[9px] font-bold mb-4">Case Statistics</Text>
           <View className="flex-row justify-between">
              <View>
                 <Text className="text-2xl font-serif text-slate-800">{gameState.history.length}</Text>
                 <Text className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Scenes Explored</Text>
              </View>
              <View className="items-end">
                 <Text className="text-2xl font-serif text-slate-800">{gameState.day}</Text>
                 <Text className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Investigation Day</Text>
              </View>
           </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
