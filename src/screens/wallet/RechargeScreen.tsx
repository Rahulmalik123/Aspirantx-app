import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../../store/slices/authSlice';
import authService from '../../api/services/authService';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import razorpayService from '../../services/razorpayService';
import walletService from '../../api/services/walletService';
import { showMessage } from 'react-native-flash-message';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 52) / 2; // 20 padding each side + 12 gap

interface CoinPackage {
  _id: string;
  name: string;
  coins: number;
  bonusCoins: number;
  price: number;
  isPopular: boolean;
}

const FALLBACK_PACKAGES: CoinPackage[] = [
  { _id: 'local_1', name: 'Starter', coins: 100, bonusCoins: 0, price: 49, isPopular: false },
  { _id: 'local_2', name: 'Popular', coins: 500, bonusCoins: 50, price: 199, isPopular: true },
  { _id: 'local_3', name: 'Pro', coins: 1000, bonusCoins: 150, price: 349, isPopular: false },
  { _id: 'local_4', name: 'Ultimate', coins: 2500, bonusCoins: 500, price: 799, isPopular: false },
];

const RechargeScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<CoinPackage[]>(FALLBACK_PACKAGES);
  const [paidBalance, setPaidBalance] = useState(0);
  const [freeBalance, setFreeBalance] = useState(0);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res: any = await apiClient.get(ENDPOINTS.COIN_PACKAGES);
        const pkgData = res.data || res;
        if (Array.isArray(pkgData) && pkgData.length > 0) {
          setPackages(pkgData);
        }
      } catch {
        // Use fallback packages
      }
    };

    const fetchWalletBalance = async () => {
      try {
        const walletRes = await walletService.getWallet();
        const walletData = (walletRes as any)?.data ?? walletRes;
        setPaidBalance(walletData?.balance || 0);
        setFreeBalance(walletData?.freeBalance || 0);
      } catch {
        setPaidBalance(user?.coins || 0);
      }
    };

    fetchPackages();
    fetchWalletBalance();
  }, []);

  const handleRecharge = async () => {
    if (!selectedPackage) return;

    const pkg = packages.find(p => p._id === selectedPackage);
    if (!pkg) return;

    try {
      setLoading(true);

      const orderResponse: any = await apiClient.post(ENDPOINTS.WALLET_RECHARGE, {
        packageId: pkg._id,
      });

      const orderData = orderResponse.data || orderResponse;
      const { orderId, amount } = orderData;

      const paymentResponse = await razorpayService.initiatePayment(
        amount / 100,
        orderId,
        user?.name,
        user?.email,
        user?.phone
      );

      const verifyResponse = await apiClient.post(ENDPOINTS.WALLET_VERIFY, {
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpaySignature: paymentResponse.razorpay_signature,
      });

      const verifyData = (verifyResponse as any);
      if (verifyData.success) {
        // Refetch user profile to update balance in Redux
        try {
          const profileRes = await authService.getProfile();
          const updatedUser = profileRes.data?.user || profileRes.data;
          if (updatedUser) {
            dispatch(setUser(updatedUser));
          }
        } catch {}

        showMessage({
          message: 'Payment Successful!',
          description: `${pkg.coins + pkg.bonusCoins} coins added to your wallet`,
          type: 'success',
          icon: 'success',
          duration: 3000,
        });
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
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

  const selectedPkg = packages.find(p => p._id === selectedPackage);

  return (
    <View style={styles.container}>
      <Header
        title="Recharge Wallet"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Header */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <View style={styles.balanceRow}>
            <View style={styles.coinBadge}>
              <Text style={styles.coinBadgeText}>C</Text>
            </View>
            <Text style={styles.balanceAmount}>{paidBalance + freeBalance}</Text>
            <Text style={styles.balanceCoinLabel}> coins</Text>
          </View>
          <View style={styles.balanceBreakdown}>
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.breakdownLabel}>Paid</Text>
              <Text style={styles.breakdownValue}>{paidBalance}</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <View style={[styles.breakdownDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.breakdownLabel}>Free</Text>
              <Text style={styles.breakdownValue}>{freeBalance}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Section Title */}
          <Text style={styles.sectionTitle}>Choose a Package</Text>
          <Text style={styles.sectionSubtitle}>Select a coin pack to recharge your wallet</Text>

          {/* Package Grid - 2 columns */}
          <View style={styles.packageGrid}>
            {packages.map((pkg) => {
              const isSelected = selectedPackage === pkg._id;
              const totalCoins = pkg.coins + pkg.bonusCoins;
              const savingsPercent = pkg.bonusCoins > 0
                ? Math.round((pkg.bonusCoins / pkg.coins) * 100)
                : 0;

              return (
                <TouchableOpacity
                  key={pkg._id}
                  activeOpacity={0.7}
                  style={[
                    styles.packageCard,
                    { width: CARD_WIDTH },
                    isSelected && styles.packageCardSelected,
                    pkg.isPopular && styles.packageCardPopular,
                  ]}
                  onPress={() => setSelectedPackage(pkg._id)}
                >
                  {/* Best Value ribbon */}
                  {pkg.isPopular && (
                    <View style={styles.ribbon}>
                      <Text style={styles.ribbonText}>BEST VALUE</Text>
                    </View>
                  )}

                  {/* Selection radio */}
                  <View style={styles.cardTopRow}>
                    <Text style={styles.packageName}>{pkg.name}</Text>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </View>

                  {/* Coin amount - hero element */}
                  <View style={styles.coinSection}>
                    <View style={styles.coinIconContainer}>
                      <Text style={styles.coinIconText}>C</Text>
                    </View>
                    <Text style={[styles.coinAmount, isSelected && styles.coinAmountSelected]}>
                      {pkg.coins.toLocaleString()}
                    </Text>
                  </View>

                  {/* Bonus badge */}
                  {pkg.bonusCoins > 0 && (
                    <View style={styles.bonusTag}>
                      <Text style={styles.bonusTagText}>+{pkg.bonusCoins} FREE</Text>
                    </View>
                  )}

                  {/* Price */}
                  <View style={styles.priceSection}>
                    <Text style={[styles.price, isSelected && styles.priceSelected]}>
                      {'\u20B9'}{pkg.price}
                    </Text>
                    {savingsPercent > 0 && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>{savingsPercent}% extra</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Order Summary - only when selected */}
          {selectedPkg && (
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Order Summary</Text>
              </View>
              <View style={styles.summaryBody}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Coins</Text>
                  <Text style={styles.summaryValue}>{selectedPkg.coins}</Text>
                </View>
                {selectedPkg.bonusCoins > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Bonus Coins</Text>
                    <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                      +{selectedPkg.bonusCoins}
                    </Text>
                  </View>
                )}
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total Coins</Text>
                  <View style={styles.totalValueRow}>
                    <View style={styles.totalCoinIcon}>
                      <Text style={styles.totalCoinIconText}>C</Text>
                    </View>
                    <Text style={styles.totalValue}>
                      {selectedPkg.coins + selectedPkg.bonusCoins}
                    </Text>
                  </View>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Amount</Text>
                  <Text style={styles.totalPrice}>{'\u20B9'}{selectedPkg.price}</Text>
                </View>
              </View>
            </View>
          )}

          {/* CTA Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.payButton,
              (!selectedPackage || loading) && styles.payButtonDisabled,
            ]}
            onPress={handleRecharge}
            disabled={!selectedPackage || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.payButtonText}>
                {selectedPkg
                  ? `Pay \u20B9${selectedPkg.price}`
                  : 'Select a package to continue'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Payment methods strip */}
          <View style={styles.methodsRow}>
            {['UPI', 'Cards', 'NetBanking', 'Wallets'].map((method) => (
              <View key={method} style={styles.methodChip}>
                <Text style={styles.methodChipText}>{method}</Text>
              </View>
            ))}
          </View>

          {/* Trust strip */}
          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <View style={[styles.trustDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.trustText}>Instant Credit</Text>
            </View>
            <View style={styles.trustItem}>
              <View style={[styles.trustDot, { backgroundColor: COLORS.info }]} />
              <Text style={styles.trustText}>Secured by Razorpay</Text>
            </View>
            <View style={styles.trustItem}>
              <View style={[styles.trustDot, { backgroundColor: COLORS.accent }]} />
              <Text style={styles.trustText}>100% Safe</Text>
            </View>
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

  // Balance Card - matches WalletScreen pattern
  balanceCard: {
    backgroundColor: COLORS.primary,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 13,
    color: '#C7D2FE',
    marginBottom: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.coin,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  coinBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7C5800',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  balanceCoinLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#C7D2FE',
    marginBottom: -4,
  },
  balanceBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
    gap: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#E0E7FF',
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  breakdownDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // Content
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },

  // Package Grid
  packageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  packageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'visible',
  },
  packageCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F4FF',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.12,
    elevation: 4,
  },
  packageCardPopular: {
    borderColor: COLORS.accent,
  },

  // Ribbon
  ribbon: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  ribbonText: {
    backgroundColor: COLORS.accent,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    letterSpacing: 0.8,
    overflow: 'hidden',
  },

  // Card top
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 2,
  },
  packageName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  // Coin section - hero
  coinSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  coinIconContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF3C4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  coinIconText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B8860B',
  },
  coinAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  coinAmountSelected: {
    color: COLORS.primary,
  },

  // Bonus
  bonusTag: {
    backgroundColor: '#D1FAE5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 10,
  },
  bonusTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },

  // Price
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto' as any,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  priceSelected: {
    color: COLORS.primary,
  },
  savingsBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  savingsText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#92400E',
  },

  // Summary
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  summaryHeader: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  summaryBody: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  totalValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalCoinIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.coin,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  totalCoinIconText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7C5800',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  // Pay Button
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  payButtonDisabled: {
    backgroundColor: COLORS.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Payment methods
  methodsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  methodChip: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  methodChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // Trust
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 20,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  trustText: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
});

export default RechargeScreen;
