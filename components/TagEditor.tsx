import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { exifToTags } from "@/lib/utils";
import { AssetInfo } from "expo-media-library";
import { useRef, useState } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";

export default function TagEditor({ asset }: { asset: AssetInfo }) {

    const [newTag, setNewTag] = useState('');
    const ref = useRef<TextInput>(null);

    const onPress = () => {
        ref.current?.focus();
    };

    const [modal, activeColor, color] = useThemeColor({}, ['modal', 'tint', 'icon']);

    if (!(asset.exif?.hasOwnProperty('ImageDescription'))) return null;

    return (
        <Pressable onPress={onPress}>
            <View style={styles.container}>
                {
                    exifToTags(asset.exif).map((line, i) => (
                        <ThemedText key={i} type='small' style={[styles.tag, {
                            backgroundColor: modal,
                        }]}>{line}</ThemedText>
                    ))
                }
                <TextInput
                    ref={ref}
                    style={[styles.tag, {
                        color: activeColor,
                        backgroundColor: modal,
                    }]}
                    placeholder="Add tag"
                    placeholderTextColor={color}
                    value={newTag}
                    onChangeText={setNewTag}
                    onBlur={() => setNewTag('')}
                    onSubmitEditing={() => console.log('TODO')}
                />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        padding: 16,
    },
    tag: {
        borderRadius: 4,
        padding: 4,
        margin: 4,
        height: 21,
        fontSize: 10,
        lineHeight: 14,
    }
});