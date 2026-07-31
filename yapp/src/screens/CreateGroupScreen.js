import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius } from '../config/theme';

export default function CreateGroupScreen({ navigation }) {
  const { user, profile } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user.uid)
      );
      const snapshot = await getDocs(q);
      const byId = {};
      snapshot.docs.forEach((d) => {
        const data = d.data();
        if (data.isGroup) return;
        const otherId = data.participants.find((id) => id !== user.uid);
        if (!otherId) return;
        byId[otherId] = {
          id: otherId,
          name: data.participantNames?.[otherId] ?? 'Usuario',
          photoURL: data.participantPhotos?.[otherId] ?? null,
        };
      });
      setContacts(Object.values(byId));
      setLoadingContacts(false);
    })();
  }, [user.uid]);

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    setError('');
    if (!groupName.trim()) {
      setError('Ponle un nombre al grupo.');
      return;
    }
    if (selectedIds.length === 0) {
      setError('Elige al menos a una persona.');
      return;
    }
    setSaving(true);
    try {
      const participants = [user.uid, ...selectedIds];
      const participantNames = { [user.uid]: profile?.name ?? '' };
      const participantPhotos = { [user.uid]: profile?.photoURL ?? null };
      selectedIds.forEach((id) => {
        const contact = contacts.find((c) => c.id === id);
        participantNames[id] = contact?.name ?? '';
        participantPhotos[id] = contact?.photoURL ?? null;
      });

      const docRef = await addDoc(collection(db, 'chats'), {
        isGroup: true,
        groupName: groupName.trim(),
        participants,
        participantNames,
        participantPhotos,
        createdBy: user.uid,
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      navigation.replace('Chat', {
        chatId: docRef.id,
        isGroup: true,
        groupName: groupName.trim(),
      });
    } catch (e) {
      setError('No hemos podido crear el grupo. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingContacts) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Nuevo grupo</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del grupo"
        placeholderTextColor={colors.textMuted}
        value={groupName}
        onChangeText={setGroupName}
      />

      {contacts.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Todavía no has hablado con nadie</Text>
          <Text style={styles.emptySubtitle}>
            Solo puedes añadir al grupo a gente con la que ya tengas un chat.
          </Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const selected = selectedIds.includes(item.id);
            return (
              <TouchableOpacity
                style={styles.contactRow}
                onPress={() => toggleSelected(item.id)}
              >
                {item.photoURL ? (
                  <Image source={{ uri: item.photoURL }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatar} />
                )}
                <Text style={styles.contactName}>{item.name}</Text>
                <View style={[styles.checkbox, selected && styles.checkboxSelected]} />
              </TouchableOpacity>
            );
          }}
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Crear grupo</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  contactName: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
    marginTop: spacing.sm,
  },
});
