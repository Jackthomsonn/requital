import { Text, View } from "react-native";
import React from "react";
import { Variables } from "../../Variables";

export function SplashScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Variables.white,
      }}
    >
      <Text>Loading..</Text>
    </View>
  );
}
