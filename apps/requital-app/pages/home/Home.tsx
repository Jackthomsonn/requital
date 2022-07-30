import { ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';

import { YourOverview } from '../../components/yourOverview/yourOverview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AllOffers } from '../../components/allOffers/allOffers';
import { Variables } from '../../Variables';

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  mainView: {
    display: 'flex',
    flex: 1,
    margin: 24,
  },
  title: {
    color: Variables.secondary,
    fontWeight: '700',
    fontSize: 28,
  },
  subTitle: {
    color: Variables.secondary,
    fontWeight: '500',
    fontSize: 14,
  },
});

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.host}>
      <ScrollView style={styles.mainView} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={{ ...styles.title, marginBottom: 24 }}>Offers overview</Text>
          <YourOverview />
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={styles.title}>All offers</Text>
          <AllOffers />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
