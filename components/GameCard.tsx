import React from 'react';
import { Dimensions, View as RNView } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS, 
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { Card, Text, View } from '@/components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface GameCardProps {
  text: string;
  leftText: string;
  rightText: string;
  leftRequiredItem?: string;
  rightRequiredItem?: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export function GameCard({ 
  text, 
  leftText, 
  rightText, 
  leftRequiredItem, 
  rightRequiredItem, 
  onSwipeLeft, 
  onSwipeRight 
}: GameCardProps) {
  const translateX = useSharedValue(0);

  // Reset position when text changes (new card)
  React.useEffect(() => {
    translateX.value = 0;
  }, [text]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, { velocity: event.velocityX });
        runOnJS(onSwipeLeft)();
      } else if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, { velocity: event.velocityX });
        runOnJS(onSwipeRight)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-10, 0, 10],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const leftLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const rightLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View className="flex-1 items-center justify-center p-4">
      <GestureDetector gesture={gesture}>
        <Animated.View style={[animatedStyle, { width: '100%', maxWidth: 400, aspectRatio: 0.7 }]}>
          <Card className="flex-1 overflow-hidden border-4 border-primary/20 bg-card p-6 shadow-2xl">
            <View className="flex-1 items-center justify-center">
              {/* Card Image Placeholder */}
              <View className="mb-8 h-48 w-48 rounded-2xl bg-muted/30 items-center justify-center">
                 <Text className="text-muted-foreground">Image</Text>
              </View>
              
              <Text variant="h3" className="text-center font-bold">
                {text}
              </Text>
            </View>

            {/* Swipe Labels */}
            <Animated.View 
              style={[leftLabelStyle]} 
              className="absolute left-6 top-6 rounded-lg border-4 border-destructive bg-background/90 p-2"
            >
              <Text className="text-xl font-bold text-destructive uppercase">{leftText}</Text>
              {leftRequiredItem && (
                <Text className="text-[10px] text-destructive font-bold text-center mt-1">Requires: {leftRequiredItem}</Text>
              )}
            </Animated.View>

            <Animated.View 
              style={[rightLabelStyle]} 
              className="absolute right-6 top-6 rounded-lg border-4 border-primary bg-background/90 p-2"
            >
              <Text className="text-xl font-bold text-primary uppercase">{rightText}</Text>
              {rightRequiredItem && (
                <Text className="text-[10px] text-primary font-bold text-center mt-1">Requires: {rightRequiredItem}</Text>
              )}
            </Animated.View>
          </Card>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
