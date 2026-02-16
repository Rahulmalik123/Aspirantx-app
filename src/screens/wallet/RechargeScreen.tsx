import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import razorpayService from '../../services/razorpayService';
import { showMessage } from 'react-native-flash-message';

const RechargeScreen = () => {
  const navigation = useNavigation<any>();
  const user = useSelector((state: any) => state.auth.user);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const packages = [
    { id: 1, coins: 100, price: 49, bonus: 0 },
    { id: 2, coins: 500, price: 199, bonus: 50, popular: true },
    { id: 3, coins: 1000, price: 349, bonus: 150 },
    { id: 4, coins: 2500, price: 799, bonus: 500 },
  ];

  const handleRecharge = async () => {
    if (!selectedPackage) return;

    const pkg = packages.find(p => p.id === selectedPackage);
    if (!pkg) return;

    try {
      setLoading(true);

      // Step 1: Create order on backend
      const orderResponse = await apiClient.post(ENDPOINTS.WALLET_RECHARGE, {
        amount: pkg.price,
        coins: pkg.coins + pkg.bonus,
      });

      const { orderId, amount } = orderResponse.data.data;

      // Step 2: Initiate Razorpay payment
      const paymentResponse = await razorpayService.initiatePayment(
        amount,
        orderId,
        user?.name,
        user?.email,
        user?.phone
      );

      // Step 3: Verify payment on backend
      const verifyResponse = await apiClient.post(ENDPOINTS.WALLET_VERIFY, {
        orderId: paymentResponse.razorpay_order_id,
        paymentId: paymentResponse.razorpay_payment_id,
        signature: paymentResponse.razorpay_signature,
      });

      if (verifyResponse.data.success) {
        showMessage({
          message: 'Success!',
          description: `${pkg.coins + pkg.bonus} coins added to your wallet`,
          type: 'success',
          icon: 'success',
          duration: 3000,
        });
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Payment failed:', error);
      Alert.alert(
        'Payment Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Recharge Wallet"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Choose a Package</Text>

          {packages.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              style={[
                styles.packageCard,
                selectedPackage === pkg.id && styles.packageCardSelected
              ]}
              onPress={() => setSelectedPackage(pkg.id)}
            >
              {pkg.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
              )}
              <View style={styles.packageLeft}>
                <Text style={styles.coinsText}>🪙 {pkg.coins}</Text>
                {pkg.bonus > 0 && (
                  <View style={styles.bonusBadge}>
                    <Text style={styles.bonusText}>+{pkg.bonus} Bonus</Text>
                  </View>
                )}
              </View>
              <View style={styles.packageRight}>
                <Text style={styles.priceText}>₹{pkg.price}</Text>
                {selectedPackage === pkg.id && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[
              styles.payButton,
              (!selectedPackage || loading) && styles.payButtonDisabled
            ]}
            onPress={handleRecharge}
            disabled={!selectedPackage || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.payButtonText}>
                {selectedPackage
                  ? `Pay ₹${packages.find(p => p.id === selectedPackage)?.price}`
                  : 'Select a package'
                }
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💳 Payment Info</Text>
            <Text style={styles.infoText}>• Secure payment via Razorpay</Text>
            <Text style={styles.infoText}>• UPI, Cards, NetBanking accepted</Text>
            <Text style={styles.infoText}>• Coins credited instantly</Text>
            <Text style={styles.infoText}>• 100% safe & encrypted</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  backIcon: {
    fontSize: 32,
    color: '#111827',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  packageCard: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  packageCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  packageLeft: {
    flex: 1,
  },
  coinsText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  bonusBadge: {
    backgroundColor: '#D1FAE5',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bonusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  packageRight: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  payButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  infoCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 4,
  },
});

export default RechargeScreen;
