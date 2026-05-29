import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import { ROUTES } from '../utils';
import theme from '../utils/theme';
import { appHeaderOptions } from './notificationHeader';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminUserFormScreen from '../screens/admin/AdminUserFormScreen';
import AdminEventsScreen from '../screens/admin/AdminEventsScreen';
import AdminEventFormScreen from '../screens/admin/AdminEventFormScreen';
import AdminTicketsScreen from '../screens/admin/AdminTicketsScreen';
import AdminTicketFormScreen from '../screens/admin/AdminTicketFormScreen';
import AdminTicketDetailScreen from '../screens/admin/AdminTicketDetailScreen';
import AdminActivityLogsScreen from '../screens/admin/AdminActivityLogsScreen';
import UserProfileScreen from '../screens/user/UserProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const tabBarOptions = {
  tabBarStyle: {
    backgroundColor: theme.colors.tuatara,
    borderTopColor: theme.colors.butterscotch,
    borderTopWidth: 2,
    paddingTop: 2,
    height: 58,
  },
  tabBarActiveTintColor: theme.colors.butterscotch,
  tabBarInactiveTintColor: theme.colors.timberwolf,
  tabBarLabelStyle: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
};

const tabIcon =
  label =>
  ({ color }) =>
    (
      <Text style={{ color, fontSize: 16, fontWeight: '700' }}>{label}</Text>
    );

const AdminTabs = () => (
  <Tab.Navigator screenOptions={{ ...appHeaderOptions, ...tabBarOptions }}>
    <Tab.Screen
      name={ROUTES.ADMIN_DASHBOARD}
      component={AdminDashboardScreen}
      options={{
        title: 'Overview',
        tabBarLabel: 'Overview',
        tabBarIcon: tabIcon('⌂'),
      }}
    />
    <Tab.Screen
      name={ROUTES.ADMIN_USERS}
      component={AdminUsersScreen}
      options={{
        title: 'Users',
        tabBarLabel: 'Users',
        tabBarIcon: tabIcon('◎'),
      }}
    />
    <Tab.Screen
      name={ROUTES.ADMIN_EVENTS}
      component={AdminEventsScreen}
      options={{
        title: 'Events',
        tabBarLabel: 'Events',
        tabBarIcon: tabIcon('☰'),
      }}
    />
    <Tab.Screen
      name={ROUTES.ADMIN_TICKETS}
      component={AdminTicketsScreen}
      options={{
        title: 'Tickets',
        tabBarLabel: 'Tickets',
        tabBarIcon: tabIcon('✦'),
      }}
    />
    <Tab.Screen
      name={ROUTES.ADMIN_ACTIVITY_LOGS}
      component={AdminActivityLogsScreen}
      options={{
        title: 'Activity',
        tabBarLabel: 'Logs',
        tabBarIcon: tabIcon('≡'),
      }}
    />
  </Tab.Navigator>
);

const AdminNavigation = () => (
  <Stack.Navigator screenOptions={appHeaderOptions}>
    <Stack.Screen
      name="AdminTabs"
      component={AdminTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name={ROUTES.ADMIN_EVENT_FORM}
      component={AdminEventFormScreen}
      options={({ route }) => ({
        title: route.params?.mode === 'edit' ? 'Edit event' : 'New event',
      })}
    />
    <Stack.Screen
      name={ROUTES.ADMIN_USER_FORM}
      component={AdminUserFormScreen}
      options={({ route }) => ({
        title: route.params?.mode === 'edit' ? 'Edit user' : 'New user',
      })}
    />
    <Stack.Screen
      name={ROUTES.ADMIN_TICKET_FORM}
      component={AdminTicketFormScreen}
      options={{ title: 'New ticket' }}
    />
    <Stack.Screen
      name={ROUTES.ADMIN_TICKET_DETAIL}
      component={AdminTicketDetailScreen}
      options={{ title: 'Ticket details' }}
    />
    <Stack.Screen
      name={ROUTES.USER_PROFILE}
      component={UserProfileScreen}
      options={{ title: 'Account' }}
    />
  </Stack.Navigator>
);

export default AdminNavigation;
