import { SafeAreaView, StyleSheet, Platform, StatusBar } from 'react-native';

export function DroidSafeAreaView({ children }: { children: React.ReactNode }) {
    return (
        <SafeAreaView style={styles.droidSafeArea}>
            {children}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    droidSafeArea: {
        flex: 1,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
});