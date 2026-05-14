import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { View, Text, Button, SafeAreaView, ScrollView, Card, CardHeader, CardTitle, CardDescription, CardContent, Spinner } from "@/components/ui";
import { Home, ArrowUpCircle, Coins, Shield, Activity, Zap, Package } from "lucide-react-native";
import { Alert } from "react-native";
import { Badge } from "@/components/ui/badge";

export default function BunkerScreen() {
  const gameState = useQuery(api.game.getGameState);
  const upgrades = useQuery(api.game.getUpgrades);
  const buyUpgrade = useMutation(api.game.buyUpgrade);

  if (gameState === undefined || upgrades === undefined) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Spinner size="large" />
      </SafeAreaView>
    );
  }

  if (!gameState) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-6">
        <Text variant="h2" className="text-center font-bold">Bunker Offline</Text>
        <Text variant="p" className="text-center text-muted-foreground mt-2">
          Initialize the game on the main screen first.
        </Text>
      </SafeAreaView>
    );
  }

  const handleUpgrade = async (id: any) => {
    try {
      await buyUpgrade({ upgradeId: id });
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Not enough resources");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="p-6 pb-20">
        <View className="flex-row items-center mb-6">
          <Home size={32} className="text-primary mr-3" />
          <View>
            <Text variant="h1" className="font-bold">The Bunker</Text>
            <Text variant="small" className="text-muted-foreground">Base of Operations</Text>
          </View>
        </View>

        <Card className="mb-6 bg-card/50">
          <CardContent className="pt-6">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Coins size={20} className="text-yellow-500 mr-2" />
                <Text variant="large" className="font-bold">{gameState.resources}</Text>
              </View>
              <Text variant="small" className="text-muted-foreground">Available Resources</Text>
            </View>
          </CardContent>
        </Card>

        {/* Inventory Section */}
        <View className="mb-8">
          <View className="flex-row items-center mb-4">
             <Package size={24} className="text-primary mr-2" />
             <Text variant="h3" className="font-bold">Inventory</Text>
          </View>
          {gameState.inventory.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {gameState.inventory.map((item, i) => (
                <Badge key={i} variant="secondary" className="px-3 py-1">
                  <Text className="text-xs font-medium">{item}</Text>
                </Badge>
              ))}
            </View>
          ) : (
            <Card className="border-dashed border-2 bg-transparent">
              <CardContent className="py-4 items-center">
                <Text variant="small" className="text-muted-foreground italic">Your backpack is empty...</Text>
              </CardContent>
            </Card>
          )}
        </View>

        <Text variant="h3" className="mb-4 font-bold">Upgrades</Text>
        
        {upgrades?.map((upgrade: any) => (
          <Card key={upgrade._id} className="mb-4">
            <CardHeader>
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <CardTitle className="text-lg">{upgrade.name}</CardTitle>
                  <CardDescription>Level {upgrade.level}</CardDescription>
                </View>
                <View className="bg-primary/10 px-2 py-1 rounded">
                   <Text className="text-primary font-bold text-xs">COST: {upgrade.cost}</Text>
                </View>
              </View>
            </CardHeader>
            <CardContent>
              <Text variant="small" className="text-muted-foreground mb-4">
                {upgrade.description}
              </Text>
              <Button 
                variant={gameState.resources >= upgrade.cost ? "default" : "outline"}
                onPress={() => handleUpgrade(upgrade._id)}
                disabled={gameState.resources < upgrade.cost}
                className="w-full"
              >
                <ArrowUpCircle size={18} className="mr-2" />
                <Text>Upgrade</Text>
              </Button>
            </CardContent>
          </Card>
        ))}

        <View className="mt-8">
           <Text variant="h3" className="mb-4 font-bold">Statistics</Text>
           <View className="flex-row flex-wrap gap-4">
              <StatsCard icon={Shield} label="Defense" value={`${gameState.shadow}%`} color="text-slate-500" />
              <StatsCard icon={Activity} label="Health" value={`${gameState.health}/100`} color="text-red-500" />
              <StatsCard icon={Zap} label="Days Survived" value={gameState.day.toString()} color="text-blue-500" />
           </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatsCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  return (
    <Card className="flex-1 min-w-[45%]">
      <CardContent className="p-4 items-center">
        <Icon size={24} className={color + " mb-1"} />
        <Text variant="small" className="text-muted-foreground">{label}</Text>
        <Text variant="large" className="font-bold">{value}</Text>
      </CardContent>
    </Card>
  );
}
