import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { exifToTags } from "@/lib/utils";
import { AssetInfo } from "expo-media-library";
import { useEffect, useRef, useState } from "react";
import { NativeSyntheticEvent, Pressable, StyleSheet, TextInput, TextInputKeyPressEventData, TextInputSubmitEditingEventData } from "react-native";
import { writeAsync, ExifTags } from '@lodev09/react-native-exify';

export default function TagEditor({ asset }: { asset: AssetInfo }) {

    const [selected, setSelected] = useState(false);
    const [tags, setTags] = useState<string[]>(() => exifToTags(asset.exif));
    const [newTag, setNewTag] = useState('');
    const [focus, setFocus] = useState(-1);
    const tagsRef = useRef(tags);
    const inputRef = useRef<TextInput>(null);
    const [modal, activeColor, color, selectedColor] = useThemeColor({}, ['modal', 'tint', 'icon', 'tabIconSelected']);

    const onSelected = () => {
        setSelected(true);
        inputRef?.current?.focus();
    }

    const onDeselected = () => {
        setSelected(false);
        inputRef?.current?.blur();
    }

    const onSubmit = (event: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
        if (!newTag) return;
        setTags([...tags, newTag]);
        setNewTag('');
    }

    const onKeyPress = ({ nativeEvent }: { nativeEvent: TextInputKeyPressEventData }) => {
        if (nativeEvent.key === 'Backspace') {
            if (newTag || tags.length < 1) return;
            if (focus > -1 && focus < tags.length) {
                setTags(tags.filter((_, i) => i !== focus));
                setFocus(focus - 1);
                return;
            }
            setTags(tags.slice(0, -1));
        }
    }

    const onTagPress = (i: number) => {
        if (focus === i) {
            setFocus(-1);
            return;
        }
        setFocus(i);
        inputRef?.current?.focus();
    }

    useEffect(() => {
        tagsRef.current = tags;
    }, [tags]);

    useEffect(() => {
        return () => {
            const old = exifToTags(asset.exif);
            const tags = tagsRef.current;
            if (old.length != tags.length || old.some((tag, i) => tag !== tags[i])) {
                // TODO: FIX THIS
                (async () => {
                    await writeAsync(asset.uri, { ImageDescription: tags.join(",") } as ExifTags);
                })();
            }
        };
    }, []);

    if (!(asset.exif?.hasOwnProperty('ImageDescription'))) return null;

    return (
        <Pressable style={[styles.outer, {
            pointerEvents: selected ? 'auto' : 'box-none',
        }]} onPress={onDeselected} >
            <Pressable style={styles.container} onPress={onSelected} >
                {
                    tags.map((line, i) => (
                        <Pressable focusable key={i} onPress={() => onTagPress(i)} style={
                            { margin: 4 }} >
                            <ThemedText type='small' style={[{
                                backgroundColor: modal,
                                borderColor: focus === i ? selectedColor : "transparent",
                            }, styles.tag]} >{line}</ThemedText>
                        </Pressable>
                    ))
                }
                <TextInput
                    ref={inputRef}
                    style={[styles.tag, {
                        margin: 4,
                        paddingTop: 6,
                        color: activeColor,
                        backgroundColor: modal,
                        borderColor: "transparent",
                    }]}
                    placeholder="Add tag"
                    placeholderTextColor={color}
                    value={newTag}
                    onChangeText={setNewTag}
                    onSubmitEditing={onSubmit}
                    blurOnSubmit={false}
                    onKeyPress={onKeyPress}
                />
            </Pressable>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    outer: {
        position: 'absolute',
        zIndex: 1,
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        justifyContent: 'flex-end',
    },
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        padding: 16,
    },
    tag: {
        borderRadius: 4,
        borderWidth: 1,
        paddingBottom: 5,
        paddingLeft: 6,
        paddingTop: 5,
        paddingRight: 4,
        height: 22,
        fontSize: 12,
        lineHeight: 13,
    }
});