
import { ThemedText } from '@/components/ThemedText';
import { useSettingsContext } from '@/hooks/useSettingsContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

export default function Settings() {
  const [color, mutedColor, backgroundColor, modalColor, tintColor] = useThemeColor({}, ['text', 'muted', 'background', 'modal', 'tint']);
  const [openKey, setOpenKey] = useState(false);
  const [settings, updateSettings] = useSettingsContext();
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
      <ScrollView style={[styles.container, { backgroundColor }]}>
        <ThemedText type="defaultSemiBold" style={[styles.sectionHeader, { color: mutedColor }]}>AI</ThemedText>
        <View style={[styles.section, { backgroundColor: modalColor }]}>
          <View style={styles.row}>
            <ThemedText type="subsubtitle" >Enable Tag Suggestions</ThemedText>
            <Switch
              trackColor={{ true: tintColor }}
              value={settings.AI.taggingEnabled}
              onValueChange={(value) => updateSettings({ AI: { taggingEnabled: value } })}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: mutedColor }]} />
          <Pressable onPress={() => setOpenKey(!openKey)}>
            <View style={[styles.row, { justifyContent: 'flex-start' }]}>
              <Feather
                name={openKey ? 'chevron-down' : 'chevron-right'}
                size={16}
                color={color}
              />
              <ThemedText type="subsubtitle" >API Key</ThemedText>
            </View>
          </Pressable>
          {
            openKey && (
              <TextInput
                placeholder="API Key"
                style={[styles.input, { color, backgroundColor }]}
                placeholderTextColor={mutedColor}
                value={settings.AI.key}
                onChangeText={(value) => updateSettings({ AI: { key: value } })}
                autoCorrect={false}
                autoComplete='off'
              />
            )
          }
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
  },
  section: {
    borderRadius: 16,
  },
  sectionHeader: {
    marginLeft: 16,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 16,
    marginTop: 0,
  }
});
