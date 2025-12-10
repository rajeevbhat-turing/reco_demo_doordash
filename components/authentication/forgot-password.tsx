'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isValidEmail } from '@/lib/utils/helperFunctions';
import { useUserByEmail } from '@/lib/hooks/use-user';

interface ForgotPasswordProps {
  onBackToSignIn: () => void;
  email?: string;
  onSuccessStateChange?: (showSuccess: boolean) => void;
  onSuccess?: () => void;
  setMode?: (mode: 'signin' | 'signup' | 'forgot-password', email?: string) => void;
}

const IllustrationImage = () => (
  <svg
    width="296"
    height="208"
    viewBox="0 0 296 208"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M153.101 170.05H222.33V165.447H148.49C148.49 167.992 150.555 170.05 153.101 170.05Z"
      fill="#C7C6B5"
    ></path>
    <path
      d="M178.522 162.788C179.307 160.15 179.286 157.265 176.118 156.424C172.95 155.582 147.698 146.361 144.417 147.521C141.136 148.68 129.659 152.555 129.659 152.555C129.659 152.555 131.498 162.286 133.845 162.201C139.036 162.01 144.735 161.777 147.345 161.253C149.94 160.73 178.522 162.788 178.522 162.788Z"
      fill="#917366"
    ></path>
    <path
      d="M144.898 147.471L88.4473 150.526L93.5104 180.24L143.109 158.672L145.499 149.387L144.898 147.471Z"
      fill="#917366"
    ></path>
    <path
      d="M105.312 148.822L133.846 147.881L134.786 153.835L109.704 158.538L105.312 148.822Z"
      fill="#C5E8E9"
    ></path>
    <path
      d="M182.942 167.922C182.942 167.922 174.605 168.346 174.442 167.207C174.273 166.069 173.353 156.424 171.232 156.735C169.118 157.046 149.106 165.355 142.133 168.042C136.632 170.156 98.4179 184.886 97.9582 183.542C97.1026 181.025 98.9482 158.92 97.2935 161.133C95.264 163.849 138.746 152.315 138.746 152.315C138.746 152.315 172.632 145.131 175.538 144.317C178.445 143.504 188.323 140.11 189.646 140.308C190.968 140.499 191.308 142.776 191.308 142.776L181.287 148.122C181.287 148.122 186.435 156.664 186.711 158.559C186.994 160.454 182.942 167.922 182.942 167.922Z"
      fill="#997D6F"
    ></path>
    <path
      d="M101.897 24.726C102.731 28.1626 105.546 33.9258 106.203 35.4815C106.861 37.0372 107.9 39.0455 107.632 39.4415C107.236 40.0284 105.369 40.6295 105.065 40.9336C104.761 41.2376 101.317 46.329 99.0964 47.7716C96.8689 49.2142 89.6773 51.1093 88.1358 50.0274C86.5942 48.9454 82.4928 41.4568 80.6967 37.9777C78.9005 34.4986 75.4426 30.9134 77.8115 28.6718C80.1805 26.4231 91.7422 24.0895 94.2879 23.7218C96.8406 23.3612 101.897 24.726 101.897 24.726Z"
      fill="#997D6F"
    ></path>
    <path
      d="M96.0979 80.3992C96.0979 80.3992 93.7927 72.1327 93.7856 68.4061C93.7785 64.6724 92.3996 53.7612 92.3996 53.7612C92.3996 53.7612 79.5155 39.4488 78.5468 38.1123C77.578 36.7758 75.2091 32.9431 72.7694 32.2501C70.3298 31.5571 69.4105 35.5029 69.2055 37.7021C69.0004 39.9013 71.1784 48.5284 71.7724 50.268C72.3664 52.0075 73.2503 56.3918 72.8826 59.9133C72.5149 63.4349 70.4642 78.7232 70.4642 78.7232L96.0979 80.3992Z"
      fill="#997D6F"
    ></path>
    <path
      d="M98.7288 204C98.644 200.648 95.2922 178.105 95.2922 178.105L35.8642 175.835L29.2808 203.965L98.7288 204Z"
      fill="#012F30"
    ></path>
    <path
      d="M105.616 41.584C106.147 41.8173 106.564 42.2204 106.811 42.7507C108.36 46.0814 110.184 54.1569 109.01 59.4675C107.745 65.2024 100.999 69.2543 96.4163 69.1553C91.629 69.0563 86.6366 63.2578 85.1728 59.0361C83.7019 54.8074 81.2199 47.7078 79.9117 43.3801C78.6035 39.0524 81.8705 35.8986 81.8705 35.8986C81.8705 35.8986 84.105 43.2174 86.6012 45.8975C89.253 48.7402 93.6726 46.8026 96.2466 45.3954C98.8206 43.9882 100.15 42.482 101.706 41.6688C103.276 40.8485 104.739 41.2092 105.616 41.584Z"
      fill="#012F30"
    ></path>
    <path
      d="M94.7122 4.9193C92.2797 4.5728 89.7128 6.02951 89.9037 10.1663C90.0239 12.818 90.6038 12.125 89.2885 11.4462C87.9732 10.7673 85.0527 8.32771 82.21 9.08435C79.3673 9.83391 81.7292 13.5393 80.2937 13.8292C78.8582 14.1192 75.0679 10.4916 69.128 12.2806C63.0395 14.1121 61.6252 17.7609 61.4414 23.4534C61.2009 31.0056 64.8993 39.3923 66.5469 43.2957C67.8763 46.4566 72.9536 56.9647 73.2081 56.7526C74.679 55.5363 76.9277 53.0118 75.0962 50.4944C73.2647 47.977 70.5069 42.3269 71.0514 39.3782C71.2989 38.0063 72.2464 35.496 75.0326 37.2214C78.4834 39.364 80.2725 44.2645 80.2725 44.2645C80.2725 44.2645 82.5424 38.6215 82.4858 38.1972C82.4222 37.773 79.9684 29.8389 79.9684 29.8389C79.9684 29.8389 81.3685 26.8052 89.8895 28.2195C93.7505 28.863 94.2314 23.9838 96.7771 25.0586C104.16 28.1771 106.776 25.6172 107.759 21.3673C108.735 17.1528 105.737 6.50329 94.7122 4.9193Z"
      fill="#012F30"
    ></path>
    <path
      d="M98.3822 41.2446C95.3203 41.2446 92.5837 38.7272 92.0957 35.2763C91.5654 31.5356 93.8777 28.106 97.2437 27.6322C98.8843 27.3988 100.525 27.8868 101.861 29.0111C103.191 30.1284 104.068 31.7336 104.322 33.5439C104.577 35.3471 104.188 37.1361 103.219 38.5787C102.243 40.0283 100.808 40.9547 99.1742 41.188C98.9055 41.2234 98.6368 41.2446 98.3822 41.2446ZM98.0357 28.106C97.7953 28.106 97.5549 28.1201 97.3144 28.1555C94.2313 28.5939 92.124 31.7548 92.612 35.2056C93.0999 38.6565 96.0133 41.1102 99.0964 40.6647C100.581 40.4526 101.897 39.604 102.781 38.2817C103.672 36.9452 104.032 35.2905 103.799 33.6146C103.558 31.9387 102.752 30.4466 101.522 29.4142C100.497 28.5585 99.2803 28.106 98.0357 28.106Z"
      fill="white"
    ></path>
    <path
      d="M93.5334 34.5701L75.4849 37.5593L75.5785 38.1244L93.627 35.1352L93.5334 34.5701Z"
      fill="white"
    ></path>
    <path
      d="M107.653 18.5458L107.307 18.4751C109.188 9.21161 98.7008 4.36771 98.5947 4.32528L98.7432 4C98.8422 4.0495 109.591 8.99947 107.653 18.5458Z"
      fill="#00686E"
    ></path>
    <path
      d="M91.6785 13.5105C91.4735 13.4115 91.1694 13.0226 90.5613 12.2094C89.2036 10.4133 86.6649 7.07556 84.5435 7.36549C83.8222 7.46449 83.2707 7.7827 82.903 8.29891C82.0615 9.47984 82.415 11.3608 82.415 11.375L82.0685 11.4457C82.0544 11.3608 81.6796 9.40205 82.613 8.09384C83.0373 7.49278 83.6737 7.12506 84.494 7.01192C86.8205 6.67957 89.3379 10.0031 90.8441 11.9902C91.2613 12.5488 91.6998 13.1216 91.8341 13.1852L91.6785 13.5105Z"
      fill="#00686E"
    ></path>
    <path
      d="M62.0352 37.9563C56.2367 25.9137 60.3098 17.3927 60.3523 17.3079L60.6705 17.4634C60.628 17.5483 56.6327 25.9279 62.3535 37.8007L62.0352 37.9563Z"
      fill="#00686E"
    ></path>
    <path
      d="M89.4723 22.4348L89.2036 22.2085C89.239 22.1661 92.6686 18.1637 96.4518 19.7194L96.6781 19.8113C100.221 21.268 101.833 21.9327 103.495 20.1649C105.298 18.2485 105.256 12.1459 101.515 7.95967L101.777 7.72632C103.551 9.71338 104.676 12.2944 104.945 14.9816C105.171 17.308 104.718 19.387 103.749 20.4124C101.925 22.357 100.122 21.6145 96.5366 20.1437L96.3104 20.0517C92.7747 18.588 89.5077 22.3924 89.4723 22.4348Z"
      fill="#00686E"
    ></path>
    <path
      d="M77.4866 16.1481L77.3664 16.0067C77.2532 15.6178 77.9179 14.3096 79.3393 12.1316C79.7918 11.4386 80.4424 11.0143 81.2839 10.8588C84.4095 10.286 89.0766 13.6449 89.2746 13.7934L89.0695 14.0762C89.02 14.0409 84.3105 10.6608 81.3475 11.2052C80.6051 11.3396 80.0323 11.7215 79.6363 12.3296C77.6846 15.3279 77.6987 15.8653 77.7129 15.9148C77.7129 15.9006 77.6916 15.8582 77.6351 15.8299L77.4866 16.1481Z"
      fill="#00686E"
    ></path>
    <path
      d="M107.434 139.855C106.295 137.218 103.87 138.71 103.509 137.26C103 135.209 105.115 130.981 104.57 129.043C103.707 125.96 101.254 124.56 100.15 123.238C97.5057 107.207 93.871 88.7928 90.5757 84.2742C84.4448 75.8875 75.4642 74.7844 73.3923 75.4208C66.13 77.6483 62.6579 85.448 61.8659 90.1858C61.1658 94.358 71.3413 133.258 75.2591 145.131C75.146 146.304 75.0965 148.921 76.4118 151.601C77.2462 153.298 79.8202 151.12 81.6446 155.066C82.0547 155.95 80.5202 159.493 80.9304 160.27C82.1961 162.675 84.657 163.29 85.1873 163.46C89.0695 164.704 106.769 150.293 106.769 150.293C106.769 150.293 109.987 145.774 107.434 139.855Z"
      fill="#A1D8D9"
    ></path>
    <path
      d="M29.4364 192.841C35.9845 202.55 92.0677 205.513 98.5804 192.403C105.086 179.292 95.8297 157.498 93.0931 131.575C91.5798 117.22 96.5227 79.904 96.5227 79.904L86.4035 72.2599L64.659 67.7695C64.659 67.7695 50.5304 90.4757 45.2481 100.673C26.9261 136.023 22.8883 183.132 29.4364 192.841Z"
      fill="#A1D8D9"
    ></path>
    <path
      d="M92.7676 87.8521C96.3528 86.6146 99.9733 80.7029 93.7152 75.3993C87.457 70.0958 41.9738 56.3137 39.117 64.4882C37.3774 69.4664 29.7474 88.3965 35.8712 97.3065C45.3469 111.089 90.6532 88.5804 92.7676 87.8521Z"
      fill="#A1D8D9"
    ></path>
    <path
      d="M37.4484 181.435L37.3564 181.095C63.959 174.123 67.1058 157.159 67.1341 156.989L67.4805 157.046C67.4523 157.215 64.2701 174.399 37.4484 181.435Z"
      fill="#38A0A0"
    ></path>
    <path
      d="M72.1759 203.986C62.6578 178.677 61.6466 159.33 62.4739 147.556C63.4215 134.064 66.8865 126.674 67.6926 125.571L67.9755 125.776C67.5229 126.391 66.4764 128.598 65.4439 132.133C64.5246 135.28 63.3225 140.52 62.8204 147.577C61.9931 159.316 62.9972 178.614 72.5012 203.858L72.1759 203.986Z"
      fill="#38A0A0"
    ></path>
    <path d="M269.291 169.824H132.905V179.229H269.291V169.824Z" fill="#E7E5D9"></path>
    <path
      d="M93.0858 131.575C92.216 123.365 93.4677 107.631 94.691 95.6732C93.3192 90.2919 91.919 86.1198 90.5684 84.2742C84.4375 75.8875 75.4642 74.7844 73.3849 75.4208C66.1226 77.6483 62.6506 85.448 61.8586 90.1858C61.1585 94.358 71.3413 133.258 75.2518 145.131C75.1387 146.304 75.0891 148.921 76.4044 151.601C77.2389 153.298 79.8202 151.12 81.6373 155.066C82.0474 155.95 80.5129 159.493 80.923 160.27C82.1888 162.675 84.6497 163.29 85.18 163.46C87.1247 164.082 92.5413 160.772 97.463 157.322C95.8366 149.387 94.0546 140.739 93.0858 131.575Z"
      fill="#8FCCCC"
    ></path>
    <path
      d="M103.406 137.12L86.5439 149.34L86.7514 149.627L103.614 137.406L103.406 137.12Z"
      fill="#38A0A0"
    ></path>
    <path
      d="M88.4896 157.555L88.1431 157.499C88.3552 156.226 103.516 139.756 105.242 137.883L105.503 138.123C98.7501 145.456 88.6381 156.671 88.4896 157.555Z"
      fill="#38A0A0"
    ></path>
    <path
      d="M115.439 124.369C115.255 124.319 97.0176 118.86 99.0966 96.8611C100.327 83.8427 96.1196 78.2705 83.5537 76.2834L83.6103 75.9369C94.1537 77.5987 100.879 81.8061 99.4502 96.8965C97.3924 118.599 115.354 123.98 115.531 124.029L115.439 124.369Z"
      fill="#38A0A0"
    ></path>
    <path
      d="M110.29 118.189C107.667 118.189 101.373 117.488 94.6484 111.598C88.1003 105.863 90.7804 96.9885 92.9372 89.8606C94.3797 85.1015 95.6172 80.993 93.8706 78.9494C92.7109 77.5988 90.2571 77.2098 86.3679 77.7543L86.3184 77.4008C90.342 76.8351 92.8947 77.2664 94.1393 78.716C96.0132 80.9011 94.7474 85.1015 93.2766 89.9596C91.1481 96.9956 88.5034 105.743 94.8818 111.329C103.537 118.91 111.436 117.778 111.514 117.764L111.57 118.111C111.549 118.125 111.089 118.189 110.29 118.189Z"
      fill="#38A0A0"
    ></path>
    <path
      d="M134.786 152.266C134.786 152.266 139.178 169.195 138.237 169.513C137.297 169.824 105.963 183.465 97.9584 183.542C89.9536 183.62 85.1733 163.46 85.1733 163.46L106.755 150.293C106.755 150.293 110.362 157.817 111.274 157.597C119.109 155.716 134.786 152.266 134.786 152.266Z"
      fill="#DDF4F4"
    ></path>
    <path
      d="M123.224 158.396L123.146 158.05L135.373 155.228L135.458 155.575L123.224 158.396Z"
      fill="#38A0A0"
    ></path>
    <path
      d="M125.105 163.099L125.027 162.759L137.254 159.931L137.339 160.277L125.105 163.099Z"
      fill="#38A0A0"
    ></path>
    <path
      d="M222.082 169.746L217.5 168.53L235.617 100.298C238.148 100.97 239.655 103.565 238.983 106.096L222.082 169.746Z"
      fill="#C7C6B5"
    ></path>
    <path
      d="M125.741 168.523L125.664 168.176L137.89 165.355L137.975 165.701L125.741 168.523Z"
      fill="#38A0A0"
    ></path>
  </svg>
);

export default function ForgotPassword({ onBackToSignIn, email, setMode }: ForgotPasswordProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: email || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shouldFetchUser, setShouldFetchUser] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use the hook to fetch user by email when shouldFetchUser is true
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useUserByEmail(shouldFetchUser && formData.email ? formData.email : '');

  // Handle user fetch result
  useEffect(() => {
    if (shouldFetchUser && !isLoading) {
      if (user) {
        // User exists - navigate to password reset page
        setShouldFetchUser(false);
        router.push(`/password_reset/${user.id}`);
      } else if (isError) {
        // User doesn't exist - show error
        const errMsg =
          "We couldn't find an account with the email you entered. Try a different email or sign up.";
        setErrors({
          general: error?.message
            ? error.message === 'User not found'
              ? errMsg
              : error.message
            : errMsg,
        });
        setShouldFetchUser(false);
      }
    }
  }, [shouldFetchUser, isLoading, user, isError, error, router]);

  // Clear timeout when component unmounts
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  // Updates form data and validates on change
  const handleFormDataChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear general error when user types
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
    // Validate email format on change
    if (field === 'email' && value.trim() && !isValidEmail(value)) {
      setErrors(prev => ({ ...prev, email: 'Email format is invalid' }));
    } else if (field === 'email' && value.trim() && isValidEmail(value)) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  // Validates email on blur
  const handleEmailBlur = () => {
    if (!formData.email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
    } else if (!isValidEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Email format is invalid' }));
    }
  };

  // Handles forgot password form submission
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }
    if (!isValidEmail(formData.email)) {
      setErrors({ email: 'Email format is invalid' });
      return;
    }

    // Clear previous errors
    setErrors({});

    // Trigger user fetch
    setShouldFetchUser(true);
  };

  return (
    <form onSubmit={handleForgotPasswordSubmit} className="pb-6 pt-2 px-2">
      {/* Forgot Password Illustration */}
      <div className="flex justify-center mb-6">
        <IllustrationImage />
      </div>

      {/* Instruction Text */}
      <p className="text-base text-left text-[#191919ff] mb-6">
        Please specify your email address to receive instructions for resetting it. If an account
        exists by that email, we will send a password reset.
      </p>

      {/* Email Field */}
      <div className="mb-6">
        <Label htmlFor="forgot-email" className="text-[15px] font-bold text-gray-900 mb-2 block">
          Email
        </Label>
        <Input
          id="forgot-email"
          type="email"
          value={formData.email}
          onChange={e => handleFormDataChange('email', e.target.value)}
          onBlur={handleEmailBlur}
          autoFocus
          className={`w-full border-2 focus-visible:ring-0 focus-visible:ring-offset-0 border-transparent 
          rounded-lg focus-visible:border-[#191919ff] ${
            errors.email ? 'border-[#b71000ff] bg-[#fef0ed]' : 'bg-[#f7f7f7]'
          }`}
        />
        {errors.email && (
          <div className="flex mt-1 text-[#b71000ff]">
            <div className="h-4 w-4 mr-2 flex-shrink-0 rounded-full flex items-center justify-center bg-[#b71000ff]">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <span className="text-sm font-semibold">{errors.email}</span>
          </div>
        )}
      </div>

      {/* General Error Message */}
      {errors.general && (
        <div className="p-3 rounded-xl bg-[#fef6d4] mb-6">
          <div className="flex">
            <div className="h-8 w-8 mr-2 flex-shrink-0 text-[#a36500]">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-[16px] font-bold text-[#191919ff] text-center">Incorrect email</p>
              <p className="text-[15px] font-medium text-[#191919ff]">{errors.general}</p>
              <button
                type="button"
                onClick={() => {
                  if (setMode) {
                    setMode('signup');
                  } else {
                    router.push('/auth/user/signup');
                  }
                }}
                className="mt-2 px-4 py-2 rounded-[24px] text-[#191919ff] 
                font-bold text-sm hover:bg-gray-50 transition-colors bg-white shadow-md"
              >
                Create an account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-[15px] py-3 rounded-3xl mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Checking...' : 'Reset Password'}
      </Button>

      {/* Back to Sign In Button */}
      <button
        type="button"
        onClick={onBackToSignIn}
        className="w-full bg-gray-100 hover:bg-gray-200 text-[#191919ff] font-bold text-[15px] py-3 rounded-3xl"
      >
        Back to Sign In
      </button>
    </form>
  );
}
