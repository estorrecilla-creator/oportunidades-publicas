import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../config/theme';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ProfileDetailScreen from '../screens/ProfileDetailScreen';
import ChatsListScreen from '../screens/ChatsListScreen';
import ChatScreen from '../screens/ChatScreen';
import RoomScreen from '../screens/RoomScreen';
import RoomsListScreen from '../screens/RoomsListScreen';
import CreateRoomScreen from '../screens/CreateRoomScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import GroupMembersScreen from '../screens/GroupMembersScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  GeneralTab: 'chatbubbles',
  ExploreTab: 'people',
  RoomsTab: 'grid',
  ChatsTab: 'mail',
  ProfileTab: 'person-circle',
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="GeneralTab"
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen
        name="GeneralTab"
        component={RoomScreen}
        options={{ title: 'General' }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreScreen}
        options={{ title: 'Explorar' }}
      />
      <Tab.Screen
        name="RoomsTab"
        component={RoomsListScreen}
        options={{ title: 'Salas' }}
      />
      <Tab.Screen
        name="ChatsTab"
        component={ChatsListScreen}
        options={{ title: 'Chats' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={EditProfileScreen}
        options={{ title: 'Mi perfil' }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProfileDetail"
        component={ProfileDetailScreen}
        options={{ title: 'Perfil' }}
      />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Room" component={RoomScreen} />
      <Stack.Screen
        name="CreateRoom"
        component={CreateRoomScreen}
        options={{ title: 'Crear sala' }}
      />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{ title: 'Nuevo grupo' }}
      />
      <Stack.Screen
        name="GroupMembers"
        component={GroupMembersScreen}
        options={{ title: 'Miembros del grupo' }}
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { user, profile, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? <AuthStack /> : !profile ? <EditProfileScreen /> : <MainStack />}
    </NavigationContainer>
  );
}
