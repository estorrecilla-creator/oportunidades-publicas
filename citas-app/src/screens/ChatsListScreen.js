import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius } from '../config/theme';

export default function ChatsListScreen({ navigation }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => {
        const data = d.data();
        const otherId = data.participants.find((id) => id !== user.uid);
        return {
          id: d.id,
          otherId,
          otherName: data.participantNames?.[otherId] ?? 'Usuario',
          otherPhoto: data.participantPhotos?.[otherId] ?? null,
          lastMessage: data.lastMessage,
        };
      });
      setChats(list);
      setLoading(false);
    });
    return unsubscribe;
  }, [user.uid]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (chats.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Todavía no tienes conversaciones</Text>
        <Text style={styles.emptySubtitle}>
          Explora perfiles y envía el primer mensaje.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={chats}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            navigation.navigate('Chat', {
              chatId: item.id,
              otherUser: { id: item.otherId, name: item.otherName, photoURL: item.otherPhoto },
            })
          }
        >
          {item.otherPhoto ? (
            <Image source={{ uri: item.otherPhoto }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar} />
          )}
          <View style={styles.rowText}>
            <Text style={styles.name}>{item.otherName}</Text>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage || 'Di hola 👋'}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  list: {
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    marginRight: spacing.md,
  },
  rowText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
});
