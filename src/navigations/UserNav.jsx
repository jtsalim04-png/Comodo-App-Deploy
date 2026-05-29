import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import { ROUTES } from '../utils';
import theme from '../utils/theme';
import { appHeaderOptions } from './notificationHeader';

import UserDashboardScreen from '../screens/user/UserDashboardScreen';
import UserEventsScreen from '../screens/user/UserEventsScreen';
import UserEventDetailScreen from '../screens/user/UserEventDetailScreen';
import UserMyTicketsScreen from '../screens/user/UserMyTicketsScreen';
import UserTicketDetailScreen from '../screens/user/UserTicketDetailScreen';
import UserProfileScreen from '../screens/user/UserProfileScreen';
import RealtimeDemoScreen from '../screens/user/RealtimeDemoScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const tabBarOptions = {
  tabBarStyle: {
    backgroundColor: theme.colors.tuatara,
    borderTopColor: theme.colors.butterscotch,
    borderTopWidth: 2,
    paddingTop: 4,
    height: 60,
  },
  tabBarActiveTintColor: theme.colors.butterscotch,
  tabBarInactiveTintColor: theme.colors.timberwolf,
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
};

const tabIcon =
  label =>
  ({ color }) =>
    (
      <Text style={{ color, fontSize: 18, fontWeight: '700' }}>{label}</Text>
    );

const UserTabs = () => (
  <Tab.Navigator screenOptions={{ ...appHeaderOptions, ...tabBarOptions }}>
    <Tab.Screen
      name={ROUTES.USER_DASHBOARD}
      component={UserDashboardScreen}
      options={{
        title: 'Dashboard',
        tabBarLabel: 'Dashboard',
        tabBarIcon: tabIcon('⌂'),
      }}
    />
    <Tab.Screen
      name={ROUTES.USER_EVENTS}
      component={UserEventsScreen}
      options={{
        title: 'Order tickets',
        tabBarLabel: 'Order tickets',
        tabBarIcon: tabIcon('☰'),
      }}
    />
    <Tab.Screen
      name={ROUTES.USER_MY_TICKETS}
      component={UserMyTicketsScreen}
      options={{
        title: 'My tickets',
        tabBarLabel: 'My tickets',
        tabBarIcon: tabIcon('✦'),
      }}
    />
    <Tab.Screen
      name={ROUTES.USER_PROFILE}
      component={UserProfileScreen}
      options={{
        title: 'My profile',
        tabBarLabel: 'Profile',
        tabBarIcon: tabIcon('◎'),
      }}
    />
  </Tab.Navigator>
);

const UserNavigation = () => (
  <Stack.Navigator screenOptions={appHeaderOptions}>
    <Stack.Screen
      name="UserTabs"
      component={UserTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name={ROUTES.USER_EVENT_DETAIL}
      component={UserEventDetailScreen}
      options={{ title: 'Event details' }}
    />
    <Stack.Screen
      name={ROUTES.USER_TICKET_DETAIL}
      component={UserTicketDetailScreen}
      options={{ title: 'Ticket' }}
    />
    <Stack.Screen
      name={ROUTES.REALTIME_DEMO}
      component={RealtimeDemoScreen}
      options={{ title: 'Realtime demo' }}
    />
  </Stack.Navigator>
);

export default UserNavigation;
