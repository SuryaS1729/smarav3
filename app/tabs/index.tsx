import { useEffect, useState } from "react";
import { View, TextInput, Button, FlatList, Text, RefreshControl } from "react-native";
import * as SQLite from "expo-sqlite";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from "react-native-safe-area-context";
const db = SQLite.openDatabaseSync("smara.db");
import * as FileSystem from 'expo-file-system';

console.log("SQLite path:", FileSystem.documentDirectory + "SQLite/smara.db");
export default function WordsScreen() {
  const [text, setText] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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
    const result = await db.getAllAsync<{ word: string }>(
      "SELECT word FROM Words ORDER BY createdAt DESC"
    );
    setWords(result.map(row => row.word));
  };

  const insertWord = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await db.runAsync(
      "INSERT INTO Words (word, createdAt) VALUES (?, ?)",
      [trimmed, Date.now()]
    );
    setText("");
    await loadWords();
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
       <StatusBar translucent style="dark" />

      <TextInput
        placeholder="Type a word"
        value={text}
        onChangeText={setText}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 10,
          borderRadius: 5,
        }}
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
          <Text style={{ paddingVertical: 10 }}>{item}</Text>
        )}
      />
      <Button title="Clear All" onPress={async () => {
        await db.execAsync("DELETE FROM Words");
        await loadWords();
      }} />
    </SafeAreaView>
  );
}