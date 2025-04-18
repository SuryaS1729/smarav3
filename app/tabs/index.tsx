import { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  RefreshControl,
  StyleSheet,
} from "react-native";
import * as SQLite from "expo-sqlite";
import { useWordStore } from "@/store/WordStore"; // Adjust if path differs

const db = SQLite.openDatabaseSync("smara.db");

type WordEntry = {
  word: string;
  createdAt: number;
};

export default function WordsScreen() {
  const [text, setText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const words = useWordStore((state) => state.words);
  const setWords = useWordStore((state) => state.setWords);
  const addWord = useWordStore((state) => state.addWord);
  const clearWords = useWordStore((state) => state.clearWords);

  useEffect(() => {
    (async () => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS Words (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          word TEXT,
          createdAt INTEGER
        );
      `);
      await loadWords();
    })();
  }, []);

  const loadWords = async () => {
    const result = await db.getAllAsync<WordEntry>(
      "SELECT word, createdAt FROM Words ORDER BY createdAt DESC"
    );
    setWords(result);
  };

  const insertWord = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newWord = {
      word: trimmed,
      createdAt: Date.now(),
    };

    await db.runAsync(
      "INSERT INTO Words (word, createdAt) VALUES (?, ?)",
      [newWord.word, newWord.createdAt]
    );

    addWord(newWord);
    setText("");
  };

  const deleteAllWords = async () => {
    await db.execAsync("DELETE FROM Words");
    clearWords();
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Type a word"
        value={text}
        onChangeText={setText}
        style={styles.input}
      />
      <Button title="Save Word" onPress={insertWord} />

      <FlatList
        data={words}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadWords();
              setRefreshing(false);
            }}
          />
        }
        renderItem={({ item }) => (
          <Text style={styles.wordItem}>{item.word}</Text>
        )}
      />

      <Button title="Clear All" color="#b91c1c" onPress={deleteAllWords} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  wordItem: {
    paddingVertical: 10,
    fontSize: 16,
  },
});