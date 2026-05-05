import { StyleSheet, Text, View } from 'react-native';
import ScreenLayout from '../components/ScreenLayout';
import { colors, spacing } from '../theme';

function PlaceholderScreen({ title, subtitle, bullets }) {
  return (
    <ScreenLayout title={title} subtitle={subtitle}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Foundation step</Text>
      </View>
      {bullets.map((item) => (
        <View key={item} style={styles.row}>
          <View style={styles.dot} />
          <Text style={styles.item}>{item}</Text>
        </View>
      ))}
      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>Goal</Text>
        <Text style={styles.noteText}>
          This screen is a structural placeholder only. The next steps can now port the web UI and business logic screen by screen while keeping the same backend.
        </Text>
      </View>
    </ScreenLayout>
  );
}

const commonBullets = [
  'Navigation route prepared',
  'Shared backend connection ready',
  'Themed mobile shell in place',
  'Ready for pixel-accurate migration from web',
];

export function HomeScreen() {
  return <PlaceholderScreen title="OSBT Mobile" subtitle="Mobile foundation aligned with the web project." bullets={commonBullets} />;
}

export function LoginScreen() {
  return <PlaceholderScreen title="Login" subtitle="Authentication flow will reuse the same backend endpoints as the web app." bullets={commonBullets} />;
}

export function RegisterScreen() {
  return <PlaceholderScreen title="Register" subtitle="Account creation will mirror the current web behavior." bullets={commonBullets} />;
}

export function DashboardScreen() {
  return <PlaceholderScreen title="Dashboard" subtitle="Main marketplace experience will be ported here in the next phase." bullets={commonBullets} />;
}

export function ProfileScreen() {
  return <PlaceholderScreen title="Profile" subtitle="Wallet, avatar, and personal items will be migrated next." bullets={commonBullets} />;
}

export function MessagesScreen() {
  return <PlaceholderScreen title="Messages" subtitle="Conversation threads, media, and polling will be adapted for mobile." bullets={commonBullets} />;
}

export function OffersScreen() {
  return <PlaceholderScreen title="Offers" subtitle="Offer negotiation flows will be recreated with the same backend contract." bullets={commonBullets} />;
}

export function PrintOnDemandScreen() {
  return <PlaceholderScreen title="Print on Demand" subtitle="The most complex screen will be migrated only after the mobile design system is stable." bullets={commonBullets} />;
}

export function AdminScreen() {
  return <PlaceholderScreen title="Admin" subtitle="Admin capabilities are reserved for a later dedicated mobile pass." bullets={commonBullets} />;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: '#F2D28A',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  badgeText: {
    color: colors.redDark,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: colors.red,
  },
  item: {
    flex: 1,
    color: colors.ink,
    lineHeight: 22,
  },
  noteBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.redSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FBC4CF',
    gap: spacing.xs,
  },
  noteTitle: {
    fontWeight: '800',
    color: colors.redDark,
  },
  noteText: {
    color: colors.ink,
    lineHeight: 21,
  },
});
