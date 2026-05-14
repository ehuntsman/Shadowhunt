import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { View, Text, Button, SafeAreaView, ScrollView, Card, CardHeader, CardTitle, CardContent, Spinner } from "@/components/ui";
import { Phone, MessageSquare, User, Info, MoreHorizontal } from "lucide-react-native";
import { Alert } from "react-native";
import { Badge } from "@/components/ui/badge";

export default function DirectoryScreen() {
  const gameState = useQuery(api.game.getGameState);
  const contacts = useQuery(api.game.getContacts);
  const messages = useQuery(api.game.getMessages);
  // Re-use logic or adapt for investigation theme
  // For now we just show the directory list

  if (gameState === undefined || contacts === undefined || messages === undefined) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Spinner size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#fbfbfb]" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="p-6 pb-20">
        <View className="flex-row items-center mb-8">
          <View className="bg-slate-900 p-2.5 rounded-xl mr-4 shadow-sm">
            <Users size={28} className="text-white" />
          </View>
          <View>
            <Text variant="h1" className="font-serif text-3xl">Directory</Text>
            <Text variant="small" className="text-muted-foreground font-light">Contacts & Communications</Text>
          </View>
        </View>

        {/* Incoming Messages */}
        <View className="mb-10">
           <View className="flex-row items-center justify-between mb-5">
              <View className="flex-row items-center">
                <MessageSquare size={18} className="text-slate-800 mr-2" />
                <Text variant="h3" className="font-serif text-xl tracking-tight">Recent Dispatches</Text>
              </View>
              {messages.filter(m => !m.read).length > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 min-w-[20px] bg-slate-800 border-none">
                   <Text className="text-[10px] font-bold text-white">{messages.filter(m => !m.read).length}</Text>
                </Badge>
              )}
           </View>

           {messages.length > 0 ? (
             <View className="gap-3">
               {messages.map((msg, i) => (
                 <View key={i} className={`p-4 rounded-xl border ${!msg.read ? 'bg-white border-slate-200 shadow-sm' : 'bg-transparent border-slate-100'}`}>
                    <View className="flex-row items-center mb-2">
                       <Text className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mr-2">{msg.from}</Text>
                       {msg.type === "hint" && <Info size={12} className="text-blue-500" />}
                    </View>
                    <Text className="text-slate-700 leading-snug">{msg.text}</Text>
                 </View>
               ))}
             </View>
           ) : (
             <Text variant="small" className="text-muted-foreground italic px-2 font-light">No active dispatches.</Text>
           )}
        </View>

        {/* Professional Contacts */}
        <Text variant="h3" className="mb-5 font-serif text-xl tracking-tight">Professional Network</Text>
        
        <View className="gap-4">
          {contacts.map((contact) => (
            <Card key={contact._id} className="border-none bg-white shadow-sm overflow-hidden">
              <CardContent className="p-5">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-row items-center flex-1 mr-3">
                    <View className="bg-slate-100 p-2.5 rounded-full mr-4">
                       <User size={20} className="text-slate-600" />
                    </View>
                    <View>
                      <Text className="text-lg font-medium text-slate-800 leading-tight">{contact.name}</Text>
                      <Text className="text-xs text-slate-400 font-light italic">{contact.role}</Text>
                    </View>
                  </View>
                  <View className="bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                     <Text className="text-slate-500 font-bold text-[10px]">${contact.cost}</Text>
                  </View>
                </View>

                <Text className="text-sm text-slate-500 font-light leading-relaxed mb-5">
                  {contact.description}
                </Text>

                <Button 
                  variant="secondary"
                  onPress={() => Alert.alert("Call Protocol", `Establishing connection with ${contact.name}...`)}
                  disabled={gameState.money < contact.cost || contact.status !== "available"}
                  className="w-full bg-slate-900 active:bg-slate-800 rounded-lg"
                >
                  <Phone size={16} className="text-white mr-2" />
                  <Text className="text-white">Request Intel</Text>
                </Button>
              </CardContent>
            </Card>
          ))}
        </View>

        <View className="mt-12 p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 items-center">
            <MoreHorizontal size={24} className="text-slate-300 mb-2" />
            <Text className="text-slate-400 text-xs font-light italic text-center">New contacts will be added as your reputation grows in Oakhaven.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
