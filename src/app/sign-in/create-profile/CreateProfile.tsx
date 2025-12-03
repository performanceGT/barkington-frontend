import React from 'react';
import Image from 'next/image';

import { svg } from '../../../svg';
import { URLS } from '../../../config';
import { Routes } from '../../../routes';
import { components } from '../../../components';
import { hooks } from '@/hooks';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserFormDataType } from '@/hooks/useAuthentication';
import { enableNotificationsAndSendToken } from '@/utility/notificationUtils';
import { stores } from '@/stores';

export const CreateProfile: React.FC = () => {

  const { handleFormInput, register } = hooks.useAuthentication()
  const { updateAmount } = stores.useWalletStore();
  const router = useRouter();
  const { data: session, status } = useSession() // Added status

  React.useEffect(() => {
    // Only redirect if session status is determined and no googleId
    if (status === 'authenticated' && !session?.user?.googleId) {
      router.replace(Routes.SIGN_IN);
    }
  }, [session, status, router]);

  // Render nothing or a loader while session is loading or if redirecting
  if (status === 'loading' || (status === 'authenticated' && !session?.user?.googleId)) {
    return null; // Or a loading spinner
  }

  const [userData, setUserData] = React.useState<UserFormDataType>({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    mobile_number: "",
    address: "",
    pincode: "",
    referral_code: ""
  })

  const [validationErrors, setValidationErrors] = React.useState<{ [key: string]: string }>({});

  // Validation function
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    // Name validation - minimum 3 characters
    if (!userData.name || userData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters long';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email || !emailRegex.test(userData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation - exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!userData.mobile_number || !phoneRegex.test(userData.mobile_number.replace(/\s/g, ''))) {
      errors.mobile_number = 'Phone number must be exactly 10 digits';
    }

    // Address validation - optional but if provided, should not be empty
    if (userData.address && userData.address.trim().length === 0) {
      errors.address = 'Address cannot be empty if provided';
    }

    // Pincode validation - optional but if provided, should be exactly 6 digits
    const pincodeRegex = /^\d{6}$/;
    if (userData.pincode && userData.pincode.trim().length > 0 && !pincodeRegex.test(userData.pincode.trim())) {
      errors.pincode = 'PIN code must be exactly 6 digits';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegistration = async () => {
    // Validate form before submitting
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    if (!session?.user?.googleId) {
      console.error('Google ID is missing, cannot register.');
      // Optionally, redirect or show an error message to the user
      // router.push(Routes.SIGN_IN);
      return;
    }
    try {
      const registrationResponse = await register(session.user.googleId) // Now googleId is guaranteed to be a string
      if (registrationResponse.status === 1) {
        // Registration successful - store user data
        if (typeof window !== 'undefined') {
          localStorage.setItem('name', registrationResponse.data?.name || session?.user?.name || "")
          localStorage.setItem('email', registrationResponse.data?.email || session?.user?.email || "")
          localStorage.setItem('image', session?.user?.image || "")
          localStorage.setItem('mobile_number', registrationResponse.data?.mobile_number?.toString() || "")
          localStorage.setItem('address', registrationResponse.data?.address || "")
          localStorage.setItem('pincode', registrationResponse.data?.pincode || "")
        }

        // Sync wallet store with the updated localStorage value
        updateAmount(registrationResponse.data?.wallet?.toString() || "0");

        // Try to enable notifications for newly registered users
        try {
          console.log('Attempting to enable notifications for new user...');
          const notificationResult = await enableNotificationsAndSendToken();

          if (notificationResult.success) {
            console.log('Notifications enabled successfully for new user');
          } else {
            console.log('Notifications not enabled for new user:', notificationResult.error);
            // Don't block the registration flow if notifications fail
          }
        } catch (error) {
          console.error('Error enabling notifications for new user:', error);
          // Don't block the registration flow if notifications fail
        }

        router.replace(Routes.TAB_NAVIGATOR)
      } else {
        console.warn('Error during registration try again!');
      }
    } catch (error) {
      console.error('An error occured during registration of new user, please signup again!');
      router.push(Routes.SIGN_IN)
    }
  }

  const renderHeader = () => {
    return (
      <components.Header
        showGoBack={false}
        title='Create profile'
      />
    );
  };

  const renderContent = () => {
    return (
      <main className='scrollable container'>
        <section
          style={{
            backgroundColor: 'var(--white-color)',
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: 10,
            paddingTop: 50,
            paddingBottom: 30,
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: 100,
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: 30,
            }}
            className='center clickable'
          >
            <Image
              src={session?.user?.image || `${URLS.MAIN_URL}/assets/users/01.jpg`}
              alt='profile'
              width={0}
              height={0}
              priority={true}
              sizes='100vw'
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                backgroundColor: 'var(--main-dark)',
                position: 'absolute',
                inset: 0,
                opacity: 0.3,
                borderRadius: '50%',
                zIndex: 9999,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 99999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <svg.CameraSvg />
            </div>
          </div>
          <components.InputField
            type='text'
            name='name'
            inputType='username'
            value={userData.name}
            placeholder='Enter your full name'
            containerStyle={{ marginBottom: validationErrors.name ? 4 : 14 }}
            onChange={(e) => {
              setUserData(pre => ({ ...pre, name: e.target.value }))
              handleFormInput(e)
              // Clear error when user starts typing
              if (validationErrors.name) {
                setValidationErrors(prev => ({ ...prev, name: '' }));
              }
            }}
          />
          {validationErrors.name && (
            <div style={{
              color: '#C53030',
              fontSize: '12px',
              marginBottom: '14px',
              marginTop: '4px',
              fontFamily: 'var(--font-dm-sans)',
            }}>
              ⚠️ {validationErrors.name}
            </div>
          )}
          <components.InputField
            type='email'
            name='email'
            inputType='email'
            placeholder='Email'
            value={userData.email}
            containerStyle={{ marginBottom: validationErrors.email ? 4 : 14 }}
            onChange={(e) => {
              setUserData(pre => ({ ...pre, email: e.target.value }))
              handleFormInput(e)
              // Clear error when user starts typing
              if (validationErrors.email) {
                setValidationErrors(prev => ({ ...prev, email: '' }));
              }
            }}
          />
          {validationErrors.email && (
            <div style={{
              color: '#C53030',
              fontSize: '12px',
              marginBottom: '14px',
              marginTop: '4px',
              fontFamily: 'var(--font-dm-sans)',
            }}>
              ⚠️ {validationErrors.email}
            </div>
          )}
          <components.InputField
            type='tel'
            name='mobile_number'
            inputType='phone'
            placeholder='Phone number'
            containerStyle={{ marginBottom: validationErrors.mobile_number ? 4 : 14 }}
            onChange={(e) => {
              setUserData(pre => ({ ...pre, mobile_number: e.target.value }))
              handleFormInput(e)
              // Clear error when user starts typing
              if (validationErrors.mobile_number) {
                setValidationErrors(prev => ({ ...prev, mobile_number: '' }));
              }
            }}
          />
          {validationErrors.mobile_number && (
            <div style={{
              color: '#C53030',
              fontSize: '12px',
              marginBottom: '14px',
              marginTop: '4px',
              fontFamily: 'var(--font-dm-sans)',
            }}>
              ⚠️ {validationErrors.mobile_number}
            </div>
          )}
          <components.InputField
            type='text'
            name='address'
            placeholder='Your address'
            inputType='location'
            containerStyle={{ marginBottom: validationErrors.address ? 4 : 20 }}
            onChange={(e) => {
              setUserData(pre => ({ ...pre, address: e.target.value }))
              handleFormInput(e)
              // Clear error when user starts typing
              if (validationErrors.address) {
                setValidationErrors(prev => ({ ...prev, address: '' }));
              }
            }}
          />
          {validationErrors.address && (
            <div style={{
              color: '#C53030',
              fontSize: '12px',
              marginBottom: '20px',
              marginTop: '4px',
              fontFamily: 'var(--font-dm-sans)',
            }}>
              ⚠️ {validationErrors.address}
            </div>
          )}
          <components.InputField
            type='text'
            name='pincode'
            placeholder='PIN code'
            inputType='pin-number'
            containerStyle={{ marginBottom: validationErrors.pincode ? 4 : 0 }}
            onChange={(e) => {
              setUserData(pre => ({ ...pre, pincode: e.target.value }))
              handleFormInput(e)
              // Clear error when user starts typing
              if (validationErrors.pincode) {
                setValidationErrors(prev => ({ ...prev, pincode: '' }));
              }
            }}
          />
          {validationErrors.pincode && (
            <div style={{
              color: '#C53030',
              fontSize: '12px',
              marginBottom: '0px',
              marginTop: '4px',
              fontFamily: 'var(--font-dm-sans)',
            }}>
              ⚠️ {validationErrors.pincode}
            </div>
          )}
        </section>

        <section
          style={{
            backgroundColor: 'var(--white-color)',
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: 10,
            paddingTop: 30,
            paddingBottom: 30,
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: 'var(--main-dark)',
                marginBottom: 8,
                margin: 0,
              }}
            >
              Have a referral code?
            </h3>
            <p
              style={{
                fontSize: 14,
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              Enter your referral code to get exclusive rewards and benefits
            </p>
          </div>
          <components.InputField
            type='text'
            name='referral_code'
            inputType='promocode'
            placeholder='Enter referral code (optional)'
            containerStyle={{ marginBottom: 0 }}
            onChange={(e) => {
              setUserData(pre => ({ ...pre, referral_code: e.target.value }))
              handleFormInput(e)
            }}
          />
        </section>

        <section
          style={{
            backgroundColor: 'var(--white-color)',
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: 10,
            paddingTop: 30,
            paddingBottom: 30,
            marginBottom: 20,
          }}
        >
          <components.Button
            label='save changes'
            href={Routes.TAB_NAVIGATOR}
            containerStyle={{ marginBottom: 0 }}
            onClick={handleRegistration}
          />
        </section>
      </main>
    );
  };

  return (
    <components.Screen>
      {renderHeader()}
      {renderContent()}
    </components.Screen>
  );
};