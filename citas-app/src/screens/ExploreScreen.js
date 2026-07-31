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
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius } from '../config/theme';

export default function ExploreScreen({ navigation }) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => p.id !== user.uid && p.name && p.photoURL);
      setProfiles(list);
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

  if (profiles.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Todavía no hay nadie más por aquí</Text>
        <Text style={styles.emptySubtitle}>
          Vuelve más tarde, la comunidad está empezando.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={profiles}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.list}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('ProfileDetail', { profileId: item.id })}
        >
          <Image source={{ uri: item.photoURL }} style={styles.photo} />
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
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
    padding: spacing.sm,
    backgroundColor: colors.background,
  },
  row: {
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  photo: {
    width: '100%',
    aspectRatio: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
    marginHorizontal: spacing.sm,
  },
  description: {
    fontSize: 12,
    color: colors.textMuted,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: 2,
  },
});
