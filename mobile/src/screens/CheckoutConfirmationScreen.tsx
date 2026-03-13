import { StackActions, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, EmptyStateTemplate, ErrorStateTemplate, LoadingStateTemplate, TopBar } from '../components';
import { VenueSession } from '../contracts';
import { ROUTE_NAMES } from '../navigation/routeGroups';
import { useServiceLocator } from '../services';
import { usePresenceSessionState } from '../state';
import { useTheme } from '../theme';

export function CheckoutConfirmationScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const services = useServiceLocator();
  const { applyCheckout } = usePresenceSessionState();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | undefined>();
  const [activeSession, setActiveSession] = useState<VenueSession | null>(null);
  const [checkoutTime, setCheckoutTime] = useState<string | undefined>();

  const loadActiveSession = useCallback(async () => {
    setIsLoading(true);
    setErrorText(undefined);

    try {
      const response = await services.presence.getMyActiveSession();

      if (response.status === 'FAIL') {
        setErrorText(response.error.message);
        setActiveSession(null);
        return;
      }

      setActiveSession(response.data);
    } catch {
      setErrorText('Unable to load active session for checkout confirmation. Please retry.');
      setActiveSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [services.presence]);

  useEffect(() => {
    void loadActiveSession();
  }, [loadActiveSession]);

  const handleConfirmCheckout = useCallback(async () => {
    if (!activeSession || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorText(undefined);

    try {
      const response = await services.presence.checkOutActiveSession();

      if (response.status === 'FAIL') {
        setErrorText(`Checkout failed: ${response.error.code}. ${response.error.message}`);
        return;
      }

      applyCheckout(response.data.checkoutTime);
      setCheckoutTime(response.data.checkoutTime);
      setActiveSession(null);
    } catch {
      setErrorText('Checkout failed: INTERNAL_ERROR.');
    } finally {
      setIsSubmitting(false);
    }
  }, [activeSession, applyCheckout, isSubmitting, services.presence]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.backgroundPrimary }]}> 
      <View style={[styles.top, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg }]}> 
        <TopBar subtitle="Checkout confirmation" title="Night Vibe" />
      </View>

      <View style={[styles.content, { gap: theme.spacing.md, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.lg }]}> 
        {isLoading ? (
          <LoadingStateTemplate message="Loading active session before checkout." title="Preparing Checkout" />
        ) : errorText ? (
          <ErrorStateTemplate actionLabel="Retry" message={errorText} onAction={() => void loadActiveSession()} title="Checkout Failed" />
        ) : activeSession ? (
          <Card subtitle={`Venue: ${activeSession.venueId}`} title="Venue Checkout Confirmation Screen">
            <View style={{ gap: theme.spacing.sm }}>
              <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.title }}>Confirm Checkout</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.bodySmall }}>
                You are about to close your active venue session.
              </Text>
              <Badge label={`Status: ${activeSession.status}`} tone={activeSession.status === 'active' ? 'success' : 'warning'} />

              <Button
                disabled={isSubmitting}
                label={isSubmitting ? 'Checking out...' : 'Confirm Checkout'}
                onPress={() => void handleConfirmCheckout()}
              />
              <Button
                label="Back to Active Session"
                onPress={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.ActiveVenueSession))}
                variant="secondary"
              />
            </View>
          </Card>
        ) : (
          <EmptyStateTemplate
            actionLabel="Return to Nearby Venues"
            message={checkoutTime ? `Checkout completed at ${checkoutTime}.` : 'No active session found to checkout.'}
            onAction={() => navigation.dispatch(StackActions.replace(ROUTE_NAMES.NearbyVenues))}
            title={checkoutTime ? 'Checkout Completed' : 'No Active Session'}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    width: '100%',
  },
  content: {
    flex: 1,
  },
});