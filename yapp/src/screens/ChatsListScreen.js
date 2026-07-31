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
        if (data.isGroup) {
          return {
            id: d.id,
            isGroup: true,
            title: data.groupName ?? 'Grupo',
            photo: null,
            lastMessage: data.lastMessage,
          };
        }
        const otherId = data.participants.find((id) => id !== user.uid);
        return {
          id: d.id,
          isGroup: false,
          otherId,
          title: data.participantNames?.[otherId] ?? 'Usuario',
          photo: data.participantPhotos?.[otherId] ?? null,
          lastMessage: data.lastMessage,
        };
      });
      setChats(list);
      setLoading(false);
    });
    return unsubscribe;
  }, [user.uid]);

  const openChat = (item) => {
    navigation.navigate('Chat', {
      chatId: item.id,
      isGroup: item.isGroup,
      groupName: item.isGroup ? item.title : undefined,
      otherUser: !item.isGroup
        ? { id: item.otherId, name: item.title, photoURL: item.photo }
        : undefined,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.newGroupButton}
        onPress={() => navigation.navigate('CreateGroup')}
      >
        <Text style={styles.newGroupButtonText}>+ Nuevo grupo</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Todavía no tienes conversaciones</Text>
          <Text style={styles.emptySubtitle}>
            Explora perfiles y envía el primer mensaje, o crea un grupo.
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => openChat(item)}>
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar} />
              )}
              <View style={styles.rowText}>
                <Text style={styles.name}>
                  {item.isGroup ? `👥 ${item.title}` : item.title}
                </Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessage || 'Di hola 👋'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
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
  newGroupButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  newGroupButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
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
