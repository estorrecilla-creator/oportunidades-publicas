import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius } from '../config/theme';

export default function EditProfileScreen({ navigation }) {
  const { user, profile, logout } = useAuth();
  const [name, setName] = useState(profile?.name ?? '');
  const [description, setDescription] = useState(profile?.description ?? '');
  const [photoUri, setPhotoUri] = useState(profile?.photoURL ?? null);
  const [pickedNewPhoto, setPickedNewPhoto] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isFirstTime = !profile;

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Necesitamos permiso para acceder a tus fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setPickedNewPhoto(true);
    }
  };

  const handleSave = async () => {
    setError('');
    if (!name.trim()) {
      setError('Escribe tu nombre.');
      return;
    }
    if (!description.trim()) {
      setError('Escribe una breve descripción sobre ti.');
      return;
    }
    if (!photoUri) {
      setError('Añade una foto de perfil.');
      return;
    }
    setSaving(true);
    try {
      let photoURL = profile?.photoURL ?? null;
      if (pickedNewPhoto) {
        const response = await fetch(photoUri);
        const blob = await response.blob();
        const storageRef = ref(storage, `profile_photos/${user.uid}.jpg`);
        await uploadBytes(storageRef, blob);
        photoURL = await getDownloadURL(storageRef);
      }

      await setDoc(
        doc(db, 'users', user.uid),
        {
          name: name.trim(),
          description: description.trim(),
          photoURL,
          email: user.email,
          updatedAt: serverTimestamp(),
          ...(isFirstTime ? { createdAt: serverTimestamp() } : {}),
        },
        { merge: true }
      );

      if (!isFirstTime) {
        navigation.goBack();
      }
      // Si es la primera vez, el AuthProvider detecta el nuevo perfil
      // y la navegación cambia automáticamente a la app principal.
    } catch (e) {
      setError('No hemos podido guardar tu perfil. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>
          {isFirstTime ? 'Crea tu perfil' : 'Editar perfil'}
        </Text>
        <Text style={styles.subtitle}>
          {isFirstTime
            ? 'Así te verán las demás personas.'
            : 'Actualiza tu foto o tu descripción.'}
        </Text>

        <TouchableOpacity style={styles.photoPicker} onPress={pickImage}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <Text style={styles.photoPlaceholder}>Añadir foto</Text>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Tu nombre"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Cuéntanos algo sobre ti..."
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Guardar</Text>
          )}
        </TouchableOpacity>

        {!isFirstTime && (
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  photoPicker: {
    alignSelf: 'center',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    color: colors.primary,
    fontWeight: '600',
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  logoutButton: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  logoutText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
