import { ThemedText } from "@/components/ThemedText";
import { useAITagging } from "@/hooks/useAITagging";
import { useThemeColor } from "@/hooks/useThemeColor";
import { cleanTags, exifToTags, isDiffTags } from "@/lib/utils";
import { Feather } from "@expo/vector-icons";
import { ExifTags, writeAsync } from '@lodev09/react-native-exify';
import { AssetInfo } from "expo-media-library";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleProp, StyleSheet, TextInput, TextInputKeyPressEventData, TextStyle, View } from "react-native";

export default function TagEditor({ asset }: { asset: AssetInfo }) {
    const [selected, setSelected] = useState(false);
    const oldTags = useMemo(() => cleanTags(exifToTags(asset.exif)), [asset.exif]);
    const [tags, setTags] = useState<string[]>(() => oldTags);
    const [newTag, setNewTag] = useState('');
    const [taggingEnabled, generateTagsFromFile, { aiTags, setAITags, isLoading, error }] = useAITagging();
    const [focus, setFocus] = useState(-1);
    const [confirmUndo, setConfirmUndo] = useState(false);
    const tagsRef = useRef(tags);
    const inputRef = useRef<TextInput>(null);
    const [field, color, mutedColor, undoColor] = useThemeColor({}, ['field', 'text', 'icon', 'danger']);

    const onSelected = () => {
        setSelected(true);
        inputRef?.current?.focus();
    }

    const onDeselected = () => {
        setSelected(false);
        inputRef?.current?.blur();
    }

    const onSubmit = () => {
        if (!newTag) {
            inputRef?.current?.blur();
            return;
        }
        setNewTag('');
        if (tags.includes(newTag)) {
            return;
        }
        setTags([...tags, newTag]);
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

    const onTagPress = (i?: number) => {
        if (i === undefined) return;
        if (focus === i) {
            setFocus(-1);
            return;
        }
        setFocus(i);
        inputRef?.current?.focus();
    }

    const onUndo = () => {
        if (!confirmUndo) {
            setConfirmUndo(true);
            return;
        }
        setTags(oldTags);
        setAITags([]);
        setFocus(-1);
        setConfirmUndo(false);
    }

    useEffect(() => {
        tagsRef.current = tags;
    }, [tags]);

    useEffect(() => {
        return () => {
            const old = exifToTags(asset.exif);
            const tags = tagsRef.current;
            if (isDiffTags(old, tags)) {
                (async () => {
                    await writeAsync(asset.uri, { ImageDescription: tags.join(",") } as ExifTags);
                })();
            }
        };
    }, []);

    // if (!(asset.exif?.hasOwnProperty('ImageDescription'))) return null;

    return (
        <Pressable style={[styles.outer, {
            pointerEvents: selected ? 'auto' : 'box-none',
        }]} onPress={onDeselected} >
            <Pressable style={styles.container} onPress={onSelected} >
                {
                    isDiffTags(oldTags, tags) || aiTags.length
                    ? <Tag style={{ backgroundColor: undoColor }} tag={!confirmUndo ? "Undo" : "Confirm?"} onPress={onUndo} />
                    : null
                }
                {
                    tags.map((tag, i) => <Tag key={i} index={i} tag={tag} onPress={onTagPress} focus={focus} />)
                }
                <TextInput
                    ref={inputRef}
                    style={[styles.tag, styles.input, {
                        color: color,
                        backgroundColor: field,
                    }]}
                    placeholder="Add tag"
                    placeholderTextColor={mutedColor}
                    value={newTag}
                    onChangeText={setNewTag}
                    onSubmitEditing={onSubmit}
                    blurOnSubmit={false}
                    onKeyPress={onKeyPress}
                    caretHidden={focus > -1}
                />
                {
                    // taggingEnabled &&
                    <>
                        {
                            aiTags.map((tag, i) => <Tag key={i} tag={tag} />)
                        }
                        <Pressable
                            // onPress={() => generateTagsFromFile(asset.uri)}
                            style={{ flexDirection: 'row', alignItems: 'center', margin: 4 }} >
                            <View style={styles.tag}>
                                <Feather name="refresh-cw" size={16} color={color} />
                                <ThemedText type='small' style={{ color: color }} >Generate tags</ThemedText>
                            </View>
                        </Pressable>
                    </>
                }
            </Pressable>
        </Pressable>
    );
}

const Tag = ({ index, tag, onPress, focus, style }: {
    index?: number,
    tag: string,
    onPress?: (i?: number) => void,
    focus?: number,
    style?: StyleProp<TextStyle>,
}) => {
    const [field, selectedColor, color] = useThemeColor({}, ['field', 'tabIconSelected', 'text']);
    return (
        <Pressable focusable onPress={() => onPress?.(index)} style={{ margin: 4 }} >
            <ThemedText type='small' style={[styles.tag, {
                backgroundColor: focus !== undefined && focus === index ? selectedColor : field,
                borderColor: focus !== undefined && focus === index ? color : 'transparent',
            }, style]} >{tag}</ThemedText>
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
        paddingLeft: 6,
        paddingTop: 7,
        paddingRight: 5,
        fontSize: 14,
        lineHeight: 13,
        height: 24,
    },
    input: {
        margin: 4,
        paddingTop: 1,
        borderColor: "transparent",
    }
});