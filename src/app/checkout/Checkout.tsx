'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import { svg } from '../../svg';
import { Routes, TabScreens } from '../../routes';
import { stores } from '../../stores';
import { components } from '../../components';
import { items } from '../../items';
import { hooks } from '../../hooks';
import { createApiService } from '@/lib/axios/apiService';
import authClient from '@/lib/axios/authClient';
import { urls } from '@/lib/config/urls';
import Script from 'next/script';

const privateApiService = createApiService(authClient);

export const Checkout: React.FC = () => {
  const router = useRouter();
  // const { goBack } = hooks.useNavigation();
  const { total, discount, delivery, orderType, preOrderDetails, subtotal, walletAmount, getOrderedCartItems } = stores.useCartStore();

  // Carousel state and hooks - exactly like Home screen
  const [activeSlide, setActiveSlide] = useState(0);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(true); // Start as true to avoid loading state
  const { carousel, carouselLoading } = hooks.useGetCarousel();
  const { getDishes, dishes } = hooks.useGetDishes();

  // Accordion states
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Multi-select payment methods
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState({
    wallet: walletAmount > 0, // Auto-select wallet if applied
    card: walletAmount === 0 || total > walletAmount // Auto-select card if wallet doesn't cover full amount
  });

  // Get wallet store for applying/removing wallet
  const { amount: walletBalance } = stores.useWalletStore();
  const { applyWalletAmount, removeWalletAmount } = stores.useCartStore();

  // Get user data from localStorage (client-side only)
  const getUserData = () => {
    if (typeof window === 'undefined') {
      // Return default values during SSR
      return {
        name: "User",
        address: "",
        pincode: "",
        mobile_number: "",
      };
    }

    return {
      name: localStorage.getItem("name") || "User",
      address: localStorage.getItem("address") || "",
      pincode: localStorage.getItem("pincode") || "",
      mobile_number: localStorage.getItem("mobile_number") || "",
    };
  };

  // Address validation logic
  const validateAddress = () => {
    const userData = getUserData();

    if (!userData.name || userData.name.trim() === "") {
      return { isValid: false, error: 'Please add your name to proceed with the order' };
    }

    if (!userData.address || userData.address.trim() === "") {
      return { isValid: false, error: 'Please add your delivery address to proceed with the order' };
    }

    if (!userData.pincode || userData.pincode.trim() === "") {
      return { isValid: false, error: 'Please add your PIN code to proceed with the order' };
    }

    if (!userData.mobile_number || userData.mobile_number.trim() === "") {
      return { isValid: false, error: 'Please add your phone number to proceed with the order' };
    }

    return { isValid: true, error: null };
  };

  useEffect(() => {
    getDishes(); // Fetch dishes for carousel links
  }, [getDishes]);

  // Auto-update payment methods when wallet amount changes
  useEffect(() => {
    setSelectedPaymentMethods({
      wallet: walletAmount > 0,
      card: walletAmount === 0 || total > walletAmount
    });
  }, [walletAmount, total]);

  useEffect(() => {
    // Fallback: Set Razorpay as loaded after 3 seconds if script doesn't load
    const fallbackTimer = setTimeout(() => {
      if (!isRazorpayLoaded) {
        console.log('Razorpay script fallback: Setting as loaded after timeout');
        setIsRazorpayLoaded(true);
      }
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, []); // Empty dependency array to run only once

  const handleSlideChange = (swiper: { realIndex: number }) => {
    setActiveSlide(swiper.realIndex);
  };

  // Carousel render function - exactly like Home screen
  const renderCarousel = () => {
    if (carouselLoading) {
      return (
        <section style={{ marginBottom: 30, position: 'relative', padding: '0 20px' }}>
          <items.SkeletonCarouselItem />
        </section>
      );
    }

    if (!carousel || carousel.length === 0) {
      return null;
    }

    return (
      <section style={{ marginBottom: 30, position: 'relative' }}>
        <Swiper
          modules={[Autoplay]}
          slidesPerView={'auto'}
          navigation={true}
          mousewheel={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          onSlideChange={handleSlideChange}
          style={{ margin: '0px 0px', height: 'clamp(200px, 30vh, 500px)' }}
        >
          {carousel.map((banner, index) => {
            const dishIdForLink = dishes && dishes[index] ? dishes[index].id : (dishes && dishes[0] ? dishes[0].id : 'fallback-id');
            return (
              <SwiperSlide key={banner.id} style={{ height: 'clamp(200px, 30vh, 400px)' }}>
                <Link href={`${Routes.MENU_ITEM}/${dishIdForLink}`} style={{ display: 'block', height: '100%', position: 'relative' }}>
                  <Image
                    src={banner.image}
                    alt='Banner'
                    fill
                    sizes='100vw'
                    priority={true}
                    className='clickable'
                    style={{ objectFit: 'cover', borderRadius: '10px' }}
                  />
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            bottom: 27,
            zIndex: 1,
            width: '100%',
            gap: 6,
          }}
        >
          {carousel.map((_, index) => {
            return (
              <div
                key={_.id}
                style={{
                  width: 8,
                  height: activeSlide === index ? 20 : 8,
                  borderRadius: 10,
                  backgroundColor:
                    activeSlide === index
                      ? 'var(--white-color)'
                      : `rgba(255, 255, 255, 0.5)`,
                }}
              />
            );
          })}
        </div>
      </section>
    );
  };

  const renderHeader = () => {
    return (
      <components.Header
        title='Checkout'
        showGoBack={true}
      />
    );
  };

  const renderContent = () => {
    return (
      <main
        className='scrollable container'
        style={{ paddingTop: 10, paddingBottom: 10 }}
      >


        {/* SUMMARY */}
        <section
          style={{
            padding: 20,
            borderRadius: 10,
            marginBottom: 14,
            border: '1px solid var(--main-turquoise)',
          }}
        >
          <div
            style={{
              paddingBottom: 20,
              marginBottom: 20,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <span
              className='t18'
              style={{ color: 'var(--main-dark)', textTransform: 'capitalize' }}
            >
              Order Summary
            </span>
          </div>

          {/* CART ITEMS */}
          <ul style={{ marginBottom: 16 }}>
            {getOrderedCartItems().map((dish) => {
              return (
                <li
                  key={dish.id}
                  style={{
                    marginBottom: 8,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <span className='t14'>{dish.product.name}</span>
                  <span className='t14'>
                    {dish.quantity} x ₹{dish.product.variants[0].sale_price}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* PRICING BREAKDOWN */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
            {/* SUBTOTAL */}
            <div
              style={{
                marginBottom: 8,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span className='t14'>Subtotal</span>
              <span className='t14'>₹{subtotal.toFixed(2)}</span>
            </div>

            {/* DISCOUNT */}
            {discount > 0 && (
              <div
                style={{
                  marginBottom: 8,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span className='t14'>Discount</span>
                <span className='t14' style={{ color: 'var(--main-turquoise)' }}>-₹{discount.toFixed(2)}</span>
              </div>
            )}

            {/* DELIVERY */}
            <div
              style={{
                marginBottom: 8,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span className='t14'>Delivery</span>
              <span className='t14'>₹{delivery.toFixed(2)}</span>
            </div>

            {/* WALLET DISCOUNT */}
            {walletAmount > 0 && (
              <div
                style={{
                  marginBottom: 8,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span className='t14' style={{ color: 'var(--main-turquoise)' }}>Wallet applied</span>
                <span className='t14' style={{ color: 'var(--main-turquoise)' }}>-₹{walletAmount.toFixed(2)}</span>
              </div>
            )}

            {/* TOTAL TO PAY */}
            <div
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span className='t16' style={{ fontWeight: 600, color: 'var(--main-dark)' }}>
                Total to Pay
              </span>
              <span className='t16' style={{ fontWeight: 600, color: 'var(--main-dark)' }}>
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* SHIPPING DETAILS ACCORDION */}
        <section style={{ marginBottom: 14 }}>
          <div
            style={{
              backgroundColor: 'var(--white-color)',
              borderRadius: 10,
              overflow: 'hidden',
              border: '1px solid #f0f0f0',
            }}
          >
            {/* Accordion Header */}
            <button
              onClick={() => setIsShippingOpen(!isShippingOpen)}
              style={{
                width: '100%',
                padding: 20,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              className='clickable'
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span
                  className='t14 number-of-lines-1'
                  style={{
                    fontWeight: 500,
                    marginBottom: 8,
                    color: 'var(--main-dark)',
                    textTransform: 'capitalize',
                  }}
                >
                  Shipping details
                </span>
                <span className='t12 number-of-lines-1' style={{ color: '#666' }}>
                  {getUserData().address.length > 30
                    ? `${getUserData().address.substring(0, 30)}...`
                    : getUserData().address}
                </span>
              </div>
              <div
                style={{
                  transform: isShippingOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <svg.RightArrowSvg />
              </div>
            </button>

            {/* Accordion Content */}
            <div
              style={{
                maxHeight: isShippingOpen ? '200px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease-in-out',
              }}
            >
              <div
                style={{
                  padding: '0 20px 20px 20px',
                  borderTop: '1px solid #f0f0f0',
                }}
              >
                <div style={{ marginTop: 16 }}>
                  <div style={{ marginBottom: 12 }}>
                    <span className='t12' style={{ color: '#999', fontWeight: 500 }}>
                      Name:
                    </span>
                    <span className='t14' style={{ color: 'var(--main-dark)', marginLeft: 8 }}>
                      {getUserData().name}
                    </span>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <span className='t12' style={{ color: '#999', fontWeight: 500 }}>
                      Address:
                    </span>
                    <span className='t14' style={{ color: 'var(--main-dark)', marginLeft: 8 }}>
                      {getUserData().address}
                    </span>
                  </div>
                  {getUserData().pincode && (
                    <div style={{ marginBottom: 12 }}>
                      <span className='t12' style={{ color: '#999', fontWeight: 500 }}>
                        PIN Code:
                      </span>
                      <span className='t14' style={{ color: 'var(--main-dark)', marginLeft: 8 }}>
                        {getUserData().pincode}
                      </span>
                    </div>
                  )}
                  {getUserData().mobile_number && (
                    <div style={{ marginBottom: 8 }}>
                      <span className='t12' style={{ color: '#999', fontWeight: 500 }}>
                        Phone:
                      </span>
                      <span className='t14' style={{ color: 'var(--main-dark)', marginLeft: 8 }}>
                        {getUserData().mobile_number}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => router.push(Routes.EDIT_PROFILE)}
                    style={{
                      marginTop: 12,
                      padding: '8px 16px',
                      backgroundColor: 'var(--main-turquoise)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    className='clickable'
                  >
                    Edit Address
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PAYMENT METHOD ACCORDION */}
        <section style={{ marginBottom: 20 }}>
          <div
            style={{
              backgroundColor: 'var(--white-color)',
              borderRadius: 10,
              overflow: 'hidden',
              border: '1px solid #f0f0f0',
            }}
          >
            {/* Accordion Header */}
            <button
              onClick={() => setIsPaymentOpen(!isPaymentOpen)}
              style={{
                width: '100%',
                padding: 20,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              className='clickable'
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span
                  className='t14 number-of-lines-1'
                  style={{
                    fontWeight: 500,
                    marginBottom: 8,
                    color: 'var(--main-dark)',
                    textTransform: 'capitalize',
                  }}
                >
                  Payment method
                </span>
                <span className='t12 number-of-lines-1' style={{ color: '#666' }}>
                  {selectedPaymentMethods.wallet && selectedPaymentMethods.card
                    ? 'Wallet + Card Payment'
                    : selectedPaymentMethods.wallet
                      ? 'Wallet Payment'
                      : 'Card Payment'}
                </span>
              </div>
              <div
                style={{
                  transform: isPaymentOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}
              >
                <svg.RightArrowSvg />
              </div>
            </button>

            {/* Accordion Content */}
            <div
              style={{
                maxHeight: isPaymentOpen ? '200px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease-in-out',
              }}
            >
              <div
                style={{
                  padding: '0 20px 20px 20px',
                  borderTop: '1px solid #f0f0f0',
                }}
              >
                <div style={{ marginTop: 16 }}>
                  <h5 style={{ marginBottom: 12, color: 'var(--main-dark)', fontSize: '14px' }}>
                    Choose Payment Methods:
                  </h5>

                  {/* Wallet Option */}
                  <button
                    onClick={() => {
                      const newWalletState = !selectedPaymentMethods.wallet;
                      setSelectedPaymentMethods(prev => ({ ...prev, wallet: newWalletState }));

                      // Apply or remove wallet amount based on checkbox state
                      if (newWalletState) {
                        applyWalletAmount(parseFloat(walletBalance));
                      } else {
                        removeWalletAmount();
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: 12,
                      marginBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      backgroundColor: selectedPaymentMethods.wallet
                        ? 'rgba(79, 209, 199, 0.1)'
                        : 'transparent',
                      border: selectedPaymentMethods.wallet
                        ? '2px solid var(--main-turquoise)'
                        : '1px solid #e0e0e0',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    className='clickable'
                  >
                    {/* Checkbox */}
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: '2px solid var(--main-turquoise)',
                        backgroundColor: selectedPaymentMethods.wallet
                          ? 'var(--main-turquoise)'
                          : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {selectedPaymentMethods.wallet && (
                        <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                      )}
                    </div>
                    <svg.WalletSvg color="var(--main-turquoise)" size={20} />
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <span className='t14' style={{ color: 'var(--main-dark)', fontWeight: 500 }}>
                        Wallet Payment
                      </span>
                      <div className='t12' style={{ color: '#666', marginTop: 2 }}>
                        {walletAmount > 0
                          ? `₹${walletAmount.toFixed(2)} available`
                          : 'Fast and secure payment'}
                      </div>
                    </div>
                  </button>

                  {/* Card Option */}
                  <button
                    onClick={() => {
                      // Prevent card selection if wallet covers full amount
                      if (selectedPaymentMethods.wallet && walletAmount >= total) {
                        return;
                      }
                      setSelectedPaymentMethods(prev => ({ ...prev, card: !prev.card }));
                    }}
                    disabled={selectedPaymentMethods.wallet && walletAmount >= total}
                    style={{
                      width: '100%',
                      padding: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      backgroundColor: selectedPaymentMethods.card
                        ? 'rgba(79, 209, 199, 0.1)'
                        : 'transparent',
                      border: selectedPaymentMethods.card
                        ? '2px solid var(--main-turquoise)'
                        : '1px solid #e0e0e0',
                      borderRadius: 8,
                      cursor: (selectedPaymentMethods.wallet && walletAmount >= total) ? 'not-allowed' : 'pointer',
                      opacity: (selectedPaymentMethods.wallet && walletAmount >= total) ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                    }}
                    className='clickable'
                  >
                    {/* Checkbox */}
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: '2px solid var(--main-turquoise)',
                        backgroundColor: selectedPaymentMethods.card
                          ? 'var(--main-turquoise)'
                          : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {selectedPaymentMethods.card && (
                        <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                      )}
                    </div>
                    {/* Better Card Icon */}
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'var(--main-turquoise)',
                        borderRadius: 4,
                      }}
                    >
                      <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>₹</span>
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <span className='t14' style={{ color: 'var(--main-dark)', fontWeight: 500 }}>
                        Card Payment
                      </span>
                      <div className='t12' style={{ color: '#666', marginTop: 2 }}>
                        {selectedPaymentMethods.wallet && walletAmount >= total
                          ? 'No additional amount to pay'
                          : selectedPaymentMethods.wallet && walletAmount > 0
                            ? `Pay remaining ₹${(total - walletAmount).toFixed(2)}`
                            : 'Credit/Debit Card, UPI, Net Banking'}
                      </div>
                    </div>
                  </button>

                  {/* Payment Summary */}
                  {selectedPaymentMethods.wallet && selectedPaymentMethods.card && walletAmount > 0 && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        backgroundColor: '#f8f9fa',
                        borderRadius: 8,
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <div className='t12' style={{ color: '#666', marginBottom: 4 }}>
                        Payment breakdown:
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span className='t12' style={{ color: 'var(--main-turquoise)' }}>Wallet:</span>
                        <span className='t12' style={{ color: 'var(--main-turquoise)', fontWeight: 600 }}>₹{walletAmount.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className='t12' style={{ color: 'var(--main-dark)' }}>Card:</span>
                        <span className='t12' style={{ color: 'var(--main-dark)', fontWeight: 600 }}>₹{(total - walletAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ADDRESS VALIDATION MESSAGE */}
        {!validateAddress().isValid && (
          <section style={{ marginBottom: 20 }}>
            <div
              style={{
                padding: '16px',
                borderRadius: '10px',
                backgroundColor: '#FFF5F5',
                border: '1px solid #FEB2B2',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '20px' }}>⚠️</div>
              <div>
                <h5 style={{
                  margin: '0 0 4px 0',
                  color: '#C53030',
                  fontSize: '14px',
                  fontWeight: 'var(--fw-semibold)'
                }}>
                  Address Required
                </h5>
                <p style={{
                  margin: 0,
                  color: '#C53030',
                  fontSize: '12px',
                  lineHeight: '1.4'
                }}>
                  {validateAddress().error}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* CAROUSEL */}
        {renderCarousel()}
      </main>
    );
  };

  const renderButton = () => {
    const addressValidation = validateAddress();
    const isCheckoutDisabled = !addressValidation.isValid;

    const handleConfirmOrder = async () => {
      // Double-check validation before proceeding
      if (isCheckoutDisabled) {
        return;
      }

      try {
        let parameter = `?order_type=${orderType}`
        if (orderType === 'Pre-Order') {
          if (!preOrderDetails?.date || !preOrderDetails?.time) {
            router.push(`${Routes.TAB_NAVIGATOR}?screen=${TabScreens.ORDER}`)
            return;
          }
          parameter += `&&scheduled_date=${preOrderDetails?.date} ${preOrderDetails?.time}`
        }

        // Determine payment scenarios
        const isWalletApplied = walletAmount > 0;
        const isFullyPaidByWallet = isWalletApplied && total === 0;
        const hasRemainingAmount = total > 0;

        console.log('Payment Flow Debug:', {
          walletAmount,
          total,
          isWalletApplied,
          isFullyPaidByWallet,
          hasRemainingAmount
        });

        // Prepare request body - always include wallet flag
        const requestBody: any = {
          wallet: isWalletApplied
        };

        // Call checkout-page API
        const orderResponse = await privateApiService.post<{
          status: number;
          razorpay_order_id?: string;
          error?: string;
        }>(
          urls["checkout-page"] + parameter,
          requestBody
        );

        if (orderResponse.status !== 1) {
          throw new Error(orderResponse.error || 'Failed to create order');
        }

        // SCENARIO 1: Wallet covers full amount (total = 0)
        if (isFullyPaidByWallet) {
          router.push(Routes.ORDER_SUCCESSFUL);
          return;
        }

        // SCENARIO 2 & 3: Remaining amount to pay (partial wallet + card OR card only)
        if (hasRemainingAmount) {
          // Ensure we have razorpay_order_id for payment
          if (!orderResponse.razorpay_order_id) {
            throw new Error('Razorpay order ID not received from backend');
          }

          // Get user details from localStorage (client-side only)
          const userName = typeof window !== 'undefined' ? (localStorage.getItem('name') || 'Customer') : 'Customer';
          const userEmail = typeof window !== 'undefined' ? (localStorage.getItem('email') || '') : '';
          const userPhone = typeof window !== 'undefined' ? (localStorage.getItem('mobile_number') || '') : '';

          // Razorpay options for remaining amount
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: total * 100, // Convert remaining amount to paise
            currency: 'INR',
            name: 'Thomson\'s Casa Store',
            description: isWalletApplied
              ? `Remaining payment for ${getOrderedCartItems().length} items (Wallet: ₹${walletAmount.toFixed(2)} applied)`
              : `Order payment for ${getOrderedCartItems().length} items`,
            order_id: orderResponse.razorpay_order_id,
            handler: async function (response: {
              razorpay_payment_id: string;
              razorpay_order_id: string;
              razorpay_signature: string;
            }) {
              try {
                console.log('Payment successful:', response);
                // Payment successful - order is already processed by backend
                router.push(Routes.ORDER_SUCCESSFUL);
              } catch (error) {
                console.error("Payment processing failed:", error);
                router.push(Routes.ORDER_FAILED);
              }
            },
            prefill: {
              name: userName,
              email: userEmail,
              contact: userPhone,
            },
            theme: {
              color: '#06402B',
            },
            modal: {
              ondismiss: function () {
                console.log('Payment modal dismissed');
                // Don't redirect to failed page on modal dismiss
                // User might just want to try again
              }
            }
          };

          // Check if Razorpay script is loaded
          if (!isRazorpayLoaded || !(window as any).Razorpay) {
            throw new Error('Razorpay script is not loaded yet. Please try again.');
          }

          // Create Razorpay instance and open
          const rzpl = new (window as any).Razorpay(options);
          rzpl.open();
        }

      } catch (error) {
        console.error("Checkout failed:", error);
        router.push(Routes.ORDER_FAILED);
      }
    };

    return (
      <section style={{ padding: 20 }}>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          onLoad={() => {
            console.log('Razorpay script loaded successfully');
            setIsRazorpayLoaded(true);
          }}
          onError={(e) => {
            console.error('Failed to load Razorpay script:', e);
            setIsRazorpayLoaded(false);
          }}
          onReady={() => {
            console.log('Razorpay script is ready');
            setIsRazorpayLoaded(true);
          }}
        />
        <components.Button
          label={isCheckoutDisabled ? 'Complete Address Required' : (isRazorpayLoaded ? 'Confirm order' : 'Loading payment...')}
          onClick={handleConfirmOrder}
          style={{
            opacity: isCheckoutDisabled || !isRazorpayLoaded ? 0.5 : 1,
            cursor: isCheckoutDisabled || !isRazorpayLoaded ? 'not-allowed' : 'pointer',
            backgroundColor: isCheckoutDisabled || !isRazorpayLoaded ? '#CCCCCC' : 'var(--main-turquoise)',
            borderColor: isCheckoutDisabled || !isRazorpayLoaded ? '#CCCCCC' : 'var(--main-turquoise)',
            pointerEvents: isCheckoutDisabled || !isRazorpayLoaded ? 'none' : 'auto',
          }}
        />
      </section>
    );
  };

  return (
    <components.Screen>
      {renderHeader()}
      {renderContent()}
      {renderButton()}
    </components.Screen>
  );
};
