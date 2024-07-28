import { ThemedText } from "@/components/ThemedText";
import { useAITagging } from "@/hooks/useAITagging";
import { useThemeColor } from "@/hooks/useThemeColor";
import { cleanTags, exifToTags, isDiffTags } from "@/lib/utils";
import { Feather } from "@expo/vector-icons";
import { ExifTags, writeAsync } from '@lodev09/react-native-exify';
import { AssetInfo } from "expo-media-library";
import { set } from "lodash";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
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
    const [field, color, mutedColor, undoColor, generateColor] = useThemeColor({}, ['field', 'text', 'icon', 'danger', 'confirm']);

    const reset = () => {
        setConfirmUndo(false);
        setFocus(-1);
        setTags(oldTags);
        setAITags([]);
        setNewTag('');
    }

    const onSelected = () => {
        setSelected(true);
        inputRef?.current?.focus();
    }

    const onDeselected = () => {
        setSelected(false);
        reset();
        inputRef?.current?.blur();
    }

    const onSubmit = () => {
        setConfirmUndo(false);
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

    const onUnsetTags = () => {
        setFocus(-1);
        setSelected(true);
        setConfirmUndo(false);
    }

    const onKeyPress = ({ nativeEvent }: { nativeEvent: TextInputKeyPressEventData }) => {
        setFocus(-1);
        setConfirmUndo(false);
        if (nativeEvent.key === 'Backspace') {
            if (newTag || tags.length < 1) return;
            if (focus > -1 && focus < tags.length) {
                setTags(tags.filter((_, i) => i !== focus));
                setFocus(focus - 1);
                return;
            }
            setFocus(tags.length - 1);
        }
    }

    const onTagPress = (i?: number) => {
        setSelected(true);
        setConfirmUndo(false);
        if (i === undefined) return;
        if (focus === i) {
            setFocus(-1);
            return;
        }
        setFocus(i);
        inputRef?.current?.focus();
    }

    const onUndo = () => {
        if (!selected) setSelected(true);
        if (!confirmUndo) {
            setConfirmUndo(true);
            return;
        }
        reset();
    }

    const onGenerateOrAdd = async () => {
        onUnsetTags();
        if (isLoading) return;
        if (aiTags.length) {
            setTags([...tags, ...aiTags]);
            setAITags([]);
            return
        }
        await generateTagsFromFile(asset.uri);
        if (error) {
            console.error(error);
            return;
        }
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
                        ? <Tag style={{ backgroundColor: undoColor }} tag={!confirmUndo ? "Undo" : "Confirm?"} onPress={onUndo}
                            icon={<Feather name="corner-down-left" size={11} color={color} />}
                        />
                        : null
                }
                {
                    tags.map((tag, i) => <Tag key={i} index={i} tag={tag} onPress={onTagPress} focus={focus} />)
                }
                <TextInput
                    ref={inputRef}
                    style={[styles.tag, styles.tagText, styles.input, {
                        color: color,
                        backgroundColor: field,
                    }]}
                    placeholder="Add tag"
                    placeholderTextColor={mutedColor}
                    value={newTag}
                    onPress={onUnsetTags}
                    onChangeText={setNewTag}
                    onSubmitEditing={onSubmit}
                    blurOnSubmit={false}
                    onKeyPress={onKeyPress}
                    caretHidden={focus > -1}
                />
                {
                    taggingEnabled &&
                    <>
                        {
                            aiTags.map((tag, i) => <Tag key={i} tag={tag} onPress={onUnsetTags} style={{
                                backgroundColor: generateColor
                            }} />)
                        }
                        <Tag tag={!isLoading ? aiTags.length ? "Add" : "Generate" : "Loading"} onPress={onGenerateOrAdd}
                            icon={<Feather name="refresh-cw" size={12} color={color} />}
                            style={{
                                backgroundColor: generateColor
                            }}
                        />
                    </>
                }
            </Pressable>
        </Pressable>
    );
}

const Tag = ({ index, tag, onPress, focus, style, icon }: {
    index?: number,
    tag: string,
    onPress?: (i?: number) => void,
    focus?: number,
    style?: StyleProp<TextStyle>,
    icon?: ReactNode,
}) => {
    const [field, selectedColor, color] = useThemeColor({}, ['field', 'tabIconSelected', 'text']);
    const isFocused = focus !== undefined && focus === index;
    return (
        <Pressable focusable onPress={() => onPress?.(index)} style={[styles.tag, {
            backgroundColor: isFocused ? selectedColor : field,
            borderColor: isFocused ? color : 'transparent',
        }, style]} >
            {icon}
            <ThemedText type='small' style={styles.tagText} >{tag}</ThemedText>
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
        gap: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        borderRadius: 4,
        borderWidth: 1,
        padding: 4,
        paddingTop: 6,
    },
    tagText: {
        fontSize: 14,
    },
    input: {
        borderColor: "transparent",
        height: 26,
    }
});