import { useState, useEffect } from "react";
import { View } from "react-native";
import { ThemedText } from "./ThemedText";

import {Album} from 'expo-media-library';


export function AlbumEntry({ album } :{ album: Album }) {
    return (
        <View>
            <ThemedText>{album.title}</ThemedText>
        </View>
    );
  }