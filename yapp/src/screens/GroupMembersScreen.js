import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { doc, onSnapshot, updateDoc, arrayRemove, deleteField } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius } from '../config/theme';

export default function GroupMembersScreen({ route }) {
  const { chatId } = route.params;
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'chats', chatId), (snap) => {
      setChat(snap.exists() ? snap.data() : null);
      setLoading(false);
    });
    return unsubscribe;
  }, [chatId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!chat) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No hemos encontrado el grupo</Text>
      </View>
    );
  }

  const isCreator = chat.createdBy === user.uid;
  const members = chat.participants.map((id) => ({
    id,
    name: chat.participantNames?.[id] ?? 'Usuario',
    photoURL: chat.participantPhotos?.[id] ?? null,
  }));

  const handleRemove = (memberId) => {
    Alert.alert('Eliminar del grupo', '¿Seguro que quieres eliminar a esta persona?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () =>
          updateDoc(doc(db, 'chats', chatId), {
            participants: arrayRemove(memberId),
            [`participantNames.${memberId}`]: deleteField(),
            [`participantPhotos.${memberId}`]: deleteField(),
          }),
      },
    ]);
  };

  return (
    <FlatList
      data={members}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.row}>
          {item.photoURL ? (
            <Image source={{ uri: item.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar} />
          )}
          <Text style={styles.name}>
            {item.name}
            {item.id === chat.createdBy ? ' (creador)' : ''}
          </Text>
          {isCreator && item.id !== user.uid && (
            <TouchableOpacity onPress={() => handleRemove(item.id)}>
              <Text style={styles.removeText}>Eliminar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  emptyTitle: {
    fontSize: 16,
    color: colors.textMuted,
  },
  list: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    marginRight: spacing.md,
  },
  name: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  removeText: {
    color: colors.danger,
    fontWeight: '600',
  },
});
