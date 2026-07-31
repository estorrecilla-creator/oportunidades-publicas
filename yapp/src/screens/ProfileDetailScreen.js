import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { getChatId } from '../utils/chat';
import { colors, spacing, radius } from '../config/theme';

export default function ProfileDetailScreen({ route, navigation }) {
  const { profileId } = route.params;
  const { user, profile: myProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, 'users', profileId));
      setProfile(snap.exists() ? snap.data() : null);
      setLoading(false);
    })();
  }, [profileId]);

  const handleStartChat = async () => {
    setStarting(true);
    try {
      const chatId = getChatId(user.uid, profileId);
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          isGroup: false,
          createdBy: user.uid,
          participants: [user.uid, profileId],
          participantNames: {
            [user.uid]: myProfile?.name ?? '',
            [profileId]: profile?.name ?? '',
          },
          participantPhotos: {
            [user.uid]: myProfile?.photoURL ?? null,
            [profileId]: profile?.photoURL ?? null,
          },
          lastMessage: '',
          lastMessageAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
      }
      navigation.navigate('Chat', {
        chatId,
        otherUser: { id: profileId, name: profile?.name, photoURL: profile?.photoURL },
      });
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No hemos encontrado este perfil</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: profile.photoURL }} style={styles.photo} />
      <View style={styles.info}>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.description}>{profile.description}</Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleStartChat}
        disabled={starting}
      >
        {starting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Enviar mensaje</Text>
        )}
      </TouchableOpacity>
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
    backgroundColor: colors.background,
  },
  emptyTitle: {
    fontSize: 16,
    color: colors.textMuted,
  },
  photo: {
    width: '100%',
    aspectRatio: 1,
  },
  info: {
    padding: spacing.lg,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 22,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: 'auto',
    marginBottom: spacing.lg,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
