
import Checkbox from '@/components/Checkbox';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';


export default function Settings() {
  const [color, backgroundColor] = useThemeColor({}, ['tint', 'background']);
  return (
    <>
      <Stack.Screen options={{
        title: 'Settings',
        headerShown: true,
        headerTintColor: color,
        headerStyle: {
          backgroundColor,
        },
      }} />
      <View style={styles.container}>
        <ThemedText type="subtitle">AI</ThemedText>
        <View style={styles.section}>

          <View style={styles.row}>
            <ThemedText type="default" >API Key</ThemedText>
            <TextInput />
            <View style={styles.row}>
              <ThemedText type="default" >Enable Tag Suggestions</ThemedText>
              <Checkbox />
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
});
