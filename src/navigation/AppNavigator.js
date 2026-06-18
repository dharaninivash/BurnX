import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/theme';
import { useStore } from '../store/useStore';

// Member Screens
import Home from '../screens/Main/Home';
import Workout from '../screens/Main/Workout';
import Nutrition from '../screens/Main/Nutrition';
import Progress from '../screens/Main/Progress';
import More from '../screens/Main/More';
import EditProfile from '../screens/Main/EditProfile';
import CalendarScreen from '../screens/Main/CalendarScreen';
import WorkoutTimer from '../screens/Main/WorkoutTimer';
import Chatbot from '../screens/Main/Chatbot';
import VideoCall from '../screens/Main/VideoCall';
import TrainerDirectory from '../screens/Main/TrainerDirectory';
import HydrationScreen from '../screens/Main/HydrationScreen';
import NotificationsScreen from '../screens/Main/NotificationsScreen';
import ReadinessScreen from '../screens/Main/ReadinessScreen';
import AboutScreen from '../screens/Main/AboutScreen';
import SupplementsScreen from '../screens/Main/SupplementsScreen';
import MenstrualTracking from '../screens/Main/MenstrualTracking';

// Trainer Screens
import TrainerDashboard from '../screens/Trainer/TrainerDashboard';

// Auth / Onboarding Screens
import Splash from '../screens/Auth/Splash';
import Login from '../screens/Auth/Login';
import Signup from '../screens/Auth/Signup';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// AppTheme will be generated dynamically below
function MemberTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        headerStyle: { backgroundColor: colors.surface, borderBottomWidth: 0 },
        headerTintColor: colors.textPrimary,
        tabBarStyle: { 
          backgroundColor: colors.surface, 
          borderTopColor: colors.border, 
          elevation: 10, 
          shadowOpacity: 0.1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Workout') iconName = focused ? 'barbell' : 'barbell-outline';
          else if (route.name === 'Nutrition') iconName = focused ? 'restaurant' : 'restaurant-outline';
          else if (route.name === 'Trainers') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Progress') iconName = focused ? 'analytics' : 'analytics-outline';
          else if (route.name === 'More') iconName = focused ? 'grid' : 'grid-outline';
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Workout" component={Workout} />
      <Tab.Screen name="Nutrition" component={Nutrition} />
      <Tab.Screen name="Trainers" component={TrainerDirectory} />
      <Tab.Screen name="Progress" component={Progress} />
      <Tab.Screen name="More" component={More} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MemberTabs" component={MemberTabs} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="CalendarScreen" component={CalendarScreen} />
      <Stack.Screen name="WorkoutTimer" component={WorkoutTimer} />
      <Stack.Screen name="VideoCall" component={VideoCall} />
      <Stack.Screen name="Chatbot" component={Chatbot} />
      <Stack.Screen name="HydrationScreen" component={HydrationScreen} />
      <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
      <Stack.Screen name="ReadinessScreen" component={ReadinessScreen} />
      <Stack.Screen name="AboutScreen" component={AboutScreen} />
      <Stack.Screen name="SupplementsScreen" component={SupplementsScreen} />
      <Stack.Screen name="MenstrualTracking" component={MenstrualTracking} />
    </Stack.Navigator>
  );
}

function TrainerTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        headerStyle: { backgroundColor: colors.surface, borderBottomWidth: 0 },
        headerTintColor: colors.textPrimary,
        tabBarStyle: { 
          backgroundColor: colors.surface, 
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = focused ? 'calendar' : 'calendar-outline';
          if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Schedule" component={TrainerDashboard} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Profile" component={More} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { colors, typography, ui } = useTheme();
  const hasCompletedOnboarding = useStore((state) => state.hasCompletedOnboarding);
  const user = useStore((state) => state.user);

  const AppTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={AppTheme}>
      {!hasCompletedOnboarding ? (
        <AuthStack />
      ) : user?.role === 'trainer' ? (
        <TrainerTabs />
      ) : (
        <MainStack />
      )}
    </NavigationContainer>
  );
}
