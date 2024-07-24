import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { exifToTags } from "@/lib/utils";
import { AssetInfo } from "expo-media-library";
import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, TextInput, Pressable, TextInputKeyPressEventData } from "react-native";

export default function TagEditor({ asset }: { asset: AssetInfo }) {

    const [tags, setTags] = useState<string[]>(() => exifToTags(asset.exif));
    const [newTag, setNewTag] = useState('');
    const [focus, setFocus] = useState(-1);
    const [modal, activeColor, color, selectedColor] = useThemeColor({}, ['modal', 'tint', 'icon', 'tabIconSelected']);

    const onSubmit = () => {
        if (!newTag) return;
        setTags([...tags, newTag]);
        setNewTag('');
    }

    const onKeyPress = ({ nativeEvent }: { nativeEvent: TextInputKeyPressEventData }) => {
        if (nativeEvent.key === 'Backspace') {
            if (newTag || tags.length < 1) return;
            if (focus > -1 && focus < tags.length) {
                setTags(tags.splice(focus, 1));
                setFocus(focus - 1);
                return;
            }
            setTags(tags.slice(0, -1));
        }
    }

    useEffect(() => {
        return () => {
            const old = exifToTags(asset.exif);
            if (old.length !== tags.length || old.some((tag, i) => tag !== tags[i])) {
                // TODO: Update tags
                console.log("TODO: Update tags")
            }
        }
    }, []);

    if (!(asset.exif?.hasOwnProperty('ImageDescription'))) return null;

    return (

        <View style={styles.container}>
            {
                tags.map((line, i) => (
                    <Pressable focusable key={i} onFocus={() => setFocus(i)} onBlur={() => setFocus(-1)}>
                        <ThemedText type='small' style={[styles.tag, {
                            backgroundColor: focus == i ? selectedColor : modal,
                        }]}>{line}</ThemedText>
                    </Pressable>
                ))
            }
            <TextInput
                style={[styles.tag, {
                    color: activeColor,
                    backgroundColor: modal,
                }]}
                placeholder="Add tag"
                placeholderTextColor={color}
                value={newTag}
                onChangeText={setNewTag}
                onBlur={() => setNewTag('')}
                onSubmitEditing={onSubmit}
                onKeyPress={onKeyPress}
            />
        </View>
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