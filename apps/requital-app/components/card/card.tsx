import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';

import React from 'react';
import { Variables } from '../../Variables';
import { useApp } from '../../contexts/appContext';

const styles = StyleSheet.create({
  card: {
    backgroundColor: Variables.white,
    borderRadius: 4,
    shadowColor: Variables.shadow,
    shadowOpacity: 1,
    shadowRadius: 9,
    shadowOffset: { width: 1, height: 1 },
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  title: {
    color: Variables.secondary,
  },
  subTitle: {
    color: Variables.secondary,
    fontWeight: '700',
    fontSize: 28,
  },
});

export function Card({ title, subTitle, style, showButton, standOut, buttonText, buttonFn }: any) {
  const { isLoading } = useApp();

  return isLoading ? (
    <View style={{ ...styles.card, width: '100%', marginBottom: 12 }}>
      <ActivityIndicator color={Variables.white}></ActivityIndicator>
    </View>
  ) : (
    <View style={{ ...styles.card, ...style, justifyContent: 'flex-end' }}>
      {standOut && <>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ ...styles.subTitle }}>{standOut}</Text>
          <View style={{ backgroundColor: Variables.primary, padding: 4, borderRadius: 4, marginLeft: 4 }}>
            <Text style={{ fontSize: 14, color: Variables.white, fontWeight: '700' }}>+{subTitle}</Text>
          </View>
        </View>
      </>
      }
      <Text style={{ ...styles.title, marginBottom: 12 }}>{title}</Text>
      {!standOut && <Text style={{ ...styles.subTitle, marginBottom: 12 }}>{subTitle}</Text>}
      {(showButton && <View style={{ backgroundColor: Variables.primary, borderRadius: 4, padding: 4 }}>
        <Button title={buttonText} color={Variables.white} onPress={buttonFn} />
      </View>)}
    </View>
  );
}
