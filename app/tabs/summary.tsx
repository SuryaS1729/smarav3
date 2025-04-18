import { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from "react-native";
import * as SQLite from "expo-sqlite";
import { SafeAreaView } from "react-native-safe-area-context";

const db = SQLite.openDatabaseSync("smara.db");

const GOOGLE_API_KEY = "AIzaSyCe1QPsd7uZNKq0_jsN-MqR2ZCIZ9i1yhY";
const GNEWS_API_KEY = "d3c25a1c19a64d5b10ef0db531f4966d"; // <-- Sign up at https://gnews.io/

export default function SummaryScreen() {
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [news, setNews] = useState("");

  useEffect(() => {
    loadRecentWords();
  }, []);

  const loadRecentWords = async () => {
    const fourDaysAgo = Date.now() - 4 * 24 * 60 * 60 * 1000;
    const result = await db.getAllAsync<{ word: string }>(
      "SELECT word FROM Words WHERE createdAt > ? ORDER BY createdAt ASC",
      [fourDaysAgo]
    );
    setWords(result.map((row) => row.word));
  };

  const fetchNews = async (): Promise<string | null> => {
    try {
      const res = await fetch(
        `https://gnews.io/api/v4/top-headlines?lang=en&max=1&apikey=${GNEWS_API_KEY}`
      );
      const data = await res.json();
      const article =
        data.articles?.[1]?.description || data.articles?.[1]?.content;
      return article || null;
    } catch (err) {
      console.error("Failed to fetch news:", err);
      return null;
    }
  };

  const generateSummary = async () => {
    if (words.length === 0) return;

    setLoading(true);
    setSummary("");
    setNews("");

    const newsArticle = await fetchNews();
    if (!newsArticle) {
      setSummary("Could not load a news article.");
      setLoading(false);
      return;
    }
    setNews(newsArticle);

    const prompt = `
Here's a short real-world news article:

"${newsArticle}"

Now rewrite this article using some of the following words, only where they fit naturally:
${words.join(", ")}

Maintain a neutral tone. Keep the structure and clarity of a news report.
Only use the words that truly fit the meaning of the article.
`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

    setSummary(text || "Could not generate summary.");
    setLoading(false);
  };

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Words you've saved this week:</Text>
        <Text style={styles.wordList}>
          {words.length ? words.join(", ") : "No words yet."}
        </Text>

        <Button
          title="Generate News Summary"
          onPress={generateSummary}
          disabled={loading || words.length === 0}
        />

        {loading && <ActivityIndicator style={{ marginTop: 20 }} />}

        {news !== "" && (
          <View style={styles.newsBox}>
            <Text style={styles.resultLabel}>Original News:</Text>
            <Text style={styles.newsText}>{news}</Text>
          </View>
        )}

        {summary !== "" && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Rewritten Using Your Words:</Text>
            <Text style={styles.resultText}>{summary}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  wordList: {
    marginBottom: 20,
    fontSize: 16,
  },
  newsBox: {
    marginTop: 30,
    backgroundColor: "#fffbe6",
    padding: 16,
    borderRadius: 10,
  },
  newsText: {
    fontSize: 15,
    lineHeight: 21,
    color: "#333",
  },
  resultBox: {
    marginTop: 30,
    backgroundColor: "#f2f2f2",
    padding: 16,
    borderRadius: 10,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  resultText: {
    fontStyle: "italic",
    fontSize: 16,
    lineHeight: 22,
  },
});