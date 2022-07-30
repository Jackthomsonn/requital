import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { View } from 'react-native';

export function Skeleton() {
  const skeletonData = [
    100, 60, 150, 200, 170, 80, 41, 101, 61, 151, 202, 172, 82, 43, 103, 64,
    155, 205, 176, 86, 46, 106, 66, 152, 203, 173, 81, 42,
  ];

  return (
    <View style={{ marginBottom: 48 }}>
      {skeletonData.map((item) => (
        <TouchableOpacity
          key={item}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: item,
              height: 15,
              backgroundColor: '#DDD',
              marginVertical: 15,
              borderRadius: 5,
            }}
          />

          <View
            style={{
              width: 30,
              height: 30,
              backgroundColor: '#DDD',
              borderRadius: 100,
            }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
