import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { View, Text, Button, SafeAreaView, ScrollView, Card, CardHeader, CardTitle, CardDescription, CardContent, Spinner } from "@/components/ui";
import { Phone, MessageSquare, Shield, User, Info, AlertCircle } from "lucide-react-native";
import { Alert } from "react-native";
import { Badge } from "@/components/ui/badge";

export default function BlackBookScreen() {
  const gameState = useQuery(api.game.getGameState);
  const contacts = useQuery(api.game.getContacts);
  const messages = useQuery(api.game.getMessages);
  const callContact = useMutation(api.game.callContact);

  if (gameState === undefined || contacts === undefined || messages === undefined) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Spinner size="large" />
      </SafeAreaView>
    );
  }

  const handleCall = async (id: any) => {
    try {
      const result = await callContact({ contactId: id });
      if (result.success) {
        Alert.alert("Call Connected", result.message);
      } else {
        Alert.alert("Line Busy", result.message);
      }
    } catch (e) {
      Alert.alert("Error", "Could not connect call.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView className="flex-1" contentContainerClassName="p-6 pb-20">
        <View className="flex-row items-center mb-6">
          <View className="bg-foreground p-2 rounded-lg mr-3">
             <Phone size={24} className="text-background" />
          </View>
          <View>
            <Text variant="h1" className="font-bold">The Black Book</Text>
            <Text variant="small" className="text-muted-foreground italic">"Everyone has a price."</Text>
          </View>
        </View>

        {/* Messages / Requests Section */}
        <View className="mb-8">
           <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <MessageSquare size={20} className="text-primary mr-2" />
                <Text variant="h3" className="font-bold">Messages</Text>
              </View>
              {messages.filter(m => !m.read).length > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 min-w-[20px] items-center justify-center">
                   <Text className="text-[10px] font-bold text-white">{messages.filter(m => !m.read).length}</Text>
                </Badge>
              )}
           </View>

           {messages.length > 0 ? (
             <View className="gap-3">
               {messages.map((msg, i) => (
                 <Card key={i} className={`bg-card/50 ${!msg.read ? 'border-primary/50' : 'border-border'}`}>
                   <CardContent className="p-4">
                      <View className="flex-row items-center mb-1">
                         <Text className="font-bold text-xs mr-2">{msg.from}</Text>
                         {msg.type === "hint" && <Info size={12} className="text-blue-500" />}
                      </View>
                      <Text variant="small" className="text-foreground">{msg.text}</Text>
                   </CardContent>
                 </Card>
               ))}
             </View>
           ) : (
             <Text variant="small" className="text-muted-foreground italic px-2">No active requests.</Text>
           )}
        </View>

        {/* Contacts Section */}
        <Text variant="h3" className="mb-4 font-bold">Contacts</Text>
        
        <View className="gap-4">
          {contacts.map((contact) => (
            <Card key={contact._id} className={contact.status === "locked" ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <View className="flex-row justify-between items-start">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-muted p-2 rounded-full mr-3">
                       <User size={18} className="text-muted-foreground" />
                    </View>
                    <View>
                      <CardTitle className="text-lg">{contact.name}</CardTitle>
                      <View className="flex-row items-center">
                        <Badge variant={contact.status === "available" ? "default" : "outline"} className="h-4 px-1 mt-0.5">
                           <Text className="text-[8px] uppercase">{contact.status}</Text>
                        </Badge>
                        <Text className="text-[10px] text-muted-foreground ml-2 uppercase tracking-tighter">{contact.type}</Text>
                      </View>
                    </View>
                  </View>
                  <View className="bg-primary/10 px-2 py-1 rounded">
                     <Text className="text-primary font-bold text-xs">${contact.cost}</Text>
                  </View>
                </View>
              </CardHeader>
              <CardContent>
                <Text variant="small" className="text-muted-foreground mb-4">
                  {contact.description}
                </Text>
                <Button 
                  variant={gameState.resources >= contact.cost && contact.status === "available" ? "default" : "outline"}
                  onPress={() => handleCall(contact._id)}
                  disabled={gameState.resources < contact.cost || contact.status !== "available"}
                  className="w-full flex-row"
                >
                  <Phone size={16} className="mr-2" />
                  <Text>{contact.status === "locked" ? "Locked" : "Call Now"}</Text>
                </Button>
              </CardContent>
            </Card>
          ))}
        </View>

        <View className="mt-8 bg-destructive/5 p-4 rounded-xl border border-destructive/10">
           <View className="flex-row items-center mb-2">
              <AlertCircle size={18} className="text-destructive mr-2" />
              <Text className="text-destructive font-bold">Emergency Signal</Text>
           </View>
           <Text variant="small" className="text-muted-foreground mb-3">Broadcast a distress call. High risk of attracting shadows.</Text>
           <Button variant="destructive" className="w-full" onPress={() => Alert.alert("Signal Broadcast", "Your signal was picked up. Something is approaching...")}>
              <Text>Signal for Help</Text>
           </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
