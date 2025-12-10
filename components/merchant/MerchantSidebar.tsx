'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import StoreSelector from './StoreSelector';
import { useCurrentStore } from '@/lib/hooks/useCurrentStore';
import { useAllRestaurants } from '@/lib/hooks/merchant/use-restaurants';
import { useMerchantAuthStore } from '@/store/merchant-auth-store';

// Icon components matching the design
const HomeIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      d="M16 12V20H20V12H16ZM10 4V20H14V4H10ZM4 20H8V10H4V20ZM16 10H20C21.1046 10 22 10.8954 22 12V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20V10C2 8.89543 2.89543 8 4 8H8V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V10Z"
      fill="currentColor"
    />
  </svg>
);

const InsightsIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      clipRule="evenodd"
      d="M12 0C16.6944 0 20.5 3.80558 20.5 8.5C20.5 11.3249 19.1206 13.8258 17 15.3711V18C17 18.7398 16.5971 19.3835 16 19.7295V20C16 22.2091 14.2091 24 12 24C9.79086 24 8 22.2091 8 20V19.7295C7.4029 19.3835 7 18.7398 7 18V15.3711C4.87935 13.8258 3.5 11.3249 3.5 8.5C3.5 3.80558 7.30558 0 12 0ZM10 20C10 21.1046 10.8954 22 12 22C13.1046 22 14 21.1046 14 20H10ZM9 18H15V16H9V18ZM12 2C8.41015 2 5.5 4.91015 5.5 8.5C5.5 10.8169 6.71329 12.849 8.53809 14H15.4619C17.2867 12.849 18.5 10.8169 18.5 8.5C18.5 4.91015 15.5899 2 12 2Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const ReportsIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      clipRule="evenodd"
      d="M13 10C13.3788 10 13.7251 10.214 13.8945 10.5528L15.6181 14H16C16.5523 14 17 14.4477 17 15C17 15.5523 16.5523 16 16 16H15C14.6213 16 14.275 15.786 14.1056 15.4472L13 13.2361L11.8945 15.4472C11.7507 15.7347 11.4775 15.9356 11.1602 15.9871C10.8429 16.0386 10.5202 15.9344 10.2929 15.7071L9.50002 14.9142L8.70713 15.7071C8.31661 16.0976 7.68344 16.0976 7.29292 15.7071C6.90239 15.3166 6.90239 14.6834 7.29292 14.2929L8.79292 12.7929C9.18344 12.4024 9.81661 12.4024 10.2071 12.7929L10.7261 13.3118L12.1056 10.5528C12.275 10.214 12.6213 10 13 10Z"
      fill="currentColor"
      fillRule="evenodd"
    />
    <path
      clipRule="evenodd"
      d="M18.362 4.07698C17.9261 3.85488 17.5101 3.794 17.2197 3.77027C17.1439 3.76408 17.0651 3.75977 16.9854 3.75677C16.8654 2.76692 16.0223 2 15 2H9.00002C7.97779 2 7.13467 2.76692 7.01466 3.75677C6.93495 3.75977 6.85611 3.76408 6.78036 3.77027C6.48993 3.794 6.07394 3.85488 5.63805 4.07698C5.07357 4.3646 4.61462 4.82354 4.327 5.38803C4.10491 5.82392 4.04402 6.2399 4.02029 6.53034C3.99981 6.78098 3.99992 7.06549 4.00001 7.30372L4.00002 7.35V18.4L4.00001 18.4463C3.99992 18.6845 3.99981 18.969 4.02029 19.2197C4.04402 19.5101 4.10491 19.9261 4.327 20.362C4.61462 20.9265 5.07357 21.3854 5.63805 21.673C6.07394 21.8951 6.48993 21.956 6.78036 21.9797C7.03101 22.0002 7.31553 22.0001 7.55377 22L7.60002 22H16.4L16.4463 22C16.6845 22.0001 16.969 22.0002 17.2197 21.9797C17.5101 21.956 17.9261 21.8951 18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362C19.8951 19.9261 19.956 19.5101 19.9798 19.2197C20.0002 18.969 20.0001 18.6845 20 18.4463L20 18.4V7.35L20 7.30372C20.0001 7.06549 20.0002 6.78098 19.9798 6.53034C19.956 6.2399 19.8951 5.82392 19.673 5.38803C19.3854 4.82354 18.9265 4.3646 18.362 4.07698ZM6.10902 6.29601C6.00002 6.50992 6.00002 6.78995 6.00002 7.35V18.4C6.00002 18.9601 6.00002 19.2401 6.10902 19.454C6.20489 19.6422 6.35787 19.7951 6.54603 19.891C6.75995 20 7.03997 20 7.60002 20H16.4C16.9601 20 17.2401 20 17.454 19.891C17.6422 19.7951 17.7952 19.6422 17.891 19.454C18 19.2401 18 18.9601 18 18.4V7.35C18 6.78995 18 6.50992 17.891 6.29601C17.7952 6.10785 17.6422 5.95487 17.454 5.85899C17.3319 5.79679 17.1883 5.77009 16.9835 5.75863C16.8566 6.74102 16.017 7.5 15 7.5H9.00002C7.98309 7.5 7.14343 6.74102 7.01659 5.75863C6.81171 5.77009 6.66811 5.7968 6.54603 5.85899C6.35787 5.95487 6.20489 6.10785 6.10902 6.29601ZM15 4H9.00002V5.5H15V4Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const CustomersIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      clipRule="evenodd"
      d="M8.50049 12C10.5178 12.0001 12.1775 12.4604 13.7319 13.2793C15.2706 14.0901 16.0005 15.7342 16.0005 17.3027V20C16.0004 21.1043 15.1047 21.9997 14.0005 22H3.00049C1.96494 22 1.11363 21.2126 1.01123 20.2041L0.999512 20V17.3018C0.999512 15.7326 1.7309 14.0876 3.271 13.2773C4.82528 12.4597 6.48482 12 8.50049 12ZM4.99994 21H12.9999V11H4.99994V21ZM14.9999 21H18.9999V11H14.9999V21ZM3.32611 9H20.6738L19.246 4H4.75385L3.32611 9Z"
      fill="currentColor"
      fillRule="evenodd"
    />
    <path
      d="M16.9067 13.0342C17.0326 12.4967 17.5703 12.1625 18.1079 12.2881C19.0457 12.5072 19.9074 12.8449 20.7319 13.2793C22.2705 14.09 23.0003 15.7334 23.0005 17.3018V19.999C23.0005 21.1034 22.1048 21.9988 21.0005 21.999H18.8999C18.3476 21.999 17.8999 21.5513 17.8999 20.999C17.9003 20.4471 18.3479 19.999 18.8999 19.999H21.0005V17.3018C21.0003 16.2971 20.5371 15.4376 19.7993 15.0488C19.1084 14.6849 18.4066 14.4115 17.6528 14.2354C17.1151 14.1097 16.7811 13.572 16.9067 13.0342Z"
      fill="currentColor"
    />
    <path
      clipRule="evenodd"
      d="M8.50049 2C10.9856 2.00026 13.0005 4.01488 13.0005 6.5C13.0004 8.98504 10.9855 10.9997 8.50049 11C6.01529 11 4.00062 8.9852 4.00049 6.5C4.00049 4.01472 6.0152 2 8.50049 2ZM8.50049 4C7.11977 4 6.00049 5.11929 6.00049 6.5C6.00062 7.88062 7.11985 9 8.50049 9C9.88092 8.99974 11.0004 7.88047 11.0005 6.5C11.0005 5.11944 9.881 4.00026 8.50049 4Z"
      fill="currentColor"
      fillRule="evenodd"
    />
    <path
      d="M15.4995 2C17.9848 2 19.9995 4.01472 19.9995 6.5C19.9994 8.9852 17.9847 11 15.4995 11C15.3423 11 15.1864 10.9915 15.0327 10.9756C14.4836 10.9186 14.0835 10.4271 14.1401 9.87793C14.1971 9.32897 14.6888 8.92987 15.2378 8.98633C15.3233 8.99518 15.411 8.99998 15.4995 9C16.8802 9 17.9994 7.88063 17.9995 6.5C17.9995 5.11928 16.8802 4 15.4995 4C15.411 4.00002 15.3233 4.00482 15.2378 4.01367C14.6889 4.0701 14.1972 3.67091 14.1401 3.12207C14.0833 2.57281 14.4835 2.08139 15.0327 2.02441C15.1864 2.00852 15.3423 2.00002 15.4995 2Z"
      fill="currentColor"
    />
  </svg>
);

const OrdersIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      d="M17 9V11C17 11.5523 16.5523 12 16 12C15.4477 12 15 11.5523 15 11V9H9V11C9 11.5523 8.55228 12 8 12C7.44772 12 7 11.5523 7 11V9H4V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V9H17ZM15 6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V7H15V6ZM17 7H20C21.1046 7 22 7.89543 22 9V19C22 21.2091 20.2091 23 18 23H6C3.79086 23 2 21.2091 2 19V9C2 7.89543 2.89543 7 4 7H7V6C7 3.23858 9.23858 1 12 1C14.7614 1 17 3.23858 17 6V7Z"
      fill="currentColor"
    />
  </svg>
);

const MenuIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      d="M3 21V3C3 1.89543 3.89543 1 5 1H13.7578C13.811 1.00001 13.864 1.00277 13.917 1.00488C13.9444 1.00263 13.972 1 14 1C14.0833 1 14.1638 1.01204 14.2412 1.03125C15.1237 1.13882 15.9508 1.53674 16.5859 2.17188L19.8281 5.41406C20.463 6.04897 20.861 6.87569 20.9688 7.75781C20.9881 7.83548 21 7.91634 21 8C21 8.02766 20.9973 8.05494 20.9951 8.08203C20.9973 8.13531 21 8.18866 21 8.24219V21C21 22.1046 20.1046 23 19 23H5C3.89543 23 3 22.1046 3 21ZM16 16C16.5523 16 17 16.4477 17 17C17 17.5523 16.5523 18 16 18H8C7.44772 18 7 17.5523 7 17C7 16.4477 7.44772 16 8 16H16ZM16 12C16.5523 12 17 12.4477 17 13C17 13.5523 16.5523 14 16 14H8C7.44772 14 7 13.5523 7 13C7 12.4477 7.44772 12 8 12H16ZM18.5654 7C18.5182 6.94052 18.4683 6.88236 18.4141 6.82812L15.1719 3.58594C15.1176 3.5317 15.0595 3.48179 15 3.43457V7H18.5654ZM5 21H19V9H15C13.8954 9 13 8.10457 13 7V3H5V21Z"
      fill="currentColor"
    />
  </svg>
);

const StoreAvailabilityIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      clipRule="evenodd"
      d="M16 1C16.5521 1.00013 16.9998 1.44796 17 2V3H18C20.2089 3.00013 21.9998 4.79111 22 7V19C22 21.2091 20.209 22.9999 18 23H6C3.79086 23 2 21.2091 2 19V7C2.0002 4.79103 3.79098 3 6 3H7V2C7.0002 1.44788 7.44784 1 8 1C8.55205 1.00013 8.9998 1.44796 9 2V3H15V2C15.0002 1.44788 15.4478 1 16 1ZM4 11V19C4 20.1046 4.89543 21 6 21H18C19.1045 20.9999 20 20.1045 20 19V11H4ZM6 5C4.89555 5 4.0002 5.8956 4 7V9H20V7C19.9998 5.89568 19.1043 5.00013 18 5H17V6C17 6.5522 16.5522 6.99987 16 7C15.4477 7 15 6.55228 15 6V5H9V6C9 6.5522 8.55217 6.99987 8 7C7.44772 7 7 6.55228 7 6V5H6Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const FinancialsIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      clipRule="evenodd"
      d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      fill="currentColor"
      fillRule="evenodd"
    />
    <path
      d="M12.8476 7.36098V6.09998H11.1576V7.34798C9.66255 7.62098 8.75255 8.71298 8.75255 9.93498C8.75255 13.185 13.2376 12.21 13.2376 13.9C13.2376 14.55 12.7176 15.07 11.7426 15.07C10.3776 15.07 9.59755 14.095 9.59755 14.095L8.42755 15.265C8.42755 15.265 9.35055 16.448 11.1576 16.708V17.93H12.8476V16.669C14.4336 16.357 15.3176 15.265 15.3176 13.9C15.3176 10.65 10.8326 11.625 10.8326 9.93498C10.8326 9.41498 11.2876 8.95998 12.0676 8.95998C13.1076 8.95998 13.7576 9.73998 13.7576 9.73998L14.9276 8.50498C14.9276 8.50498 14.2386 7.64698 12.8476 7.36098Z"
      fill="currentColor"
    />
  </svg>
);

const SettingsIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      d="M19.0003 12C19.0003 11.6453 18.9737 11.2974 18.9231 10.958L18.8392 10.3975L19.2767 10.0381L20.6204 8.93164L18.9681 6.06836L16.805 6.87891L16.3616 6.52539C15.8199 6.09316 15.2131 5.73958 14.5589 5.48242L14.0315 5.27539L13.6526 3H10.347L9.96807 5.27539L9.44072 5.48242C8.7865 5.73957 8.17965 6.09319 7.63799 6.52539L7.19463 6.87891L5.03252 6.06836L3.3792 8.93164L4.72295 10.0381L5.16045 10.3975L5.07646 10.958C5.02587 11.2974 5.00029 11.6453 5.00029 12C5.00029 12.3549 5.02581 12.7033 5.07646 13.043L5.16045 13.6025L4.72295 13.9619L3.3792 15.0684L5.03252 17.9316L7.19463 17.1211L7.63799 17.4756C8.11194 17.8537 8.63576 18.1713 9.19756 18.417L9.44072 18.5176L9.96807 18.7246L10.347 21H13.6526L14.0315 18.7246L14.5589 18.5176C15.213 18.2605 15.8201 17.9076 16.3616 17.4756L16.805 17.1211L18.9681 17.9316L20.6204 15.0684L19.2767 13.9619L18.8392 13.6025L18.9231 13.043C18.9738 12.7034 19.0003 12.3548 19.0003 12ZM14.0003 12C14.0003 10.8956 13.1046 10.0003 12.0003 10C10.8957 10 10.0003 10.8954 10.0003 12C10.0003 13.1046 10.8957 14 12.0003 14C13.1046 13.9997 14.0003 13.1044 14.0003 12ZM16.0003 12C16.0003 14.209 14.2092 15.9997 12.0003 16C9.79115 16 8.00029 14.2091 8.00029 12C8.00029 9.79086 9.79115 8 12.0003 8C14.2092 8.00025 16.0003 9.79102 16.0003 12ZM21.0003 12C21.0003 12.2568 20.9873 12.511 20.9661 12.7627L21.8919 13.5244C22.6466 14.1457 22.8414 15.2217 22.3528 16.0684L20.6995 18.9316C20.2106 19.7782 19.1814 20.1477 18.2659 19.8047L17.1438 19.3838C16.7276 19.6742 16.2855 19.9295 15.8216 20.1475L15.6253 21.3291C15.4644 22.2933 14.6302 23 13.6526 23H10.347C9.3694 23 8.53518 22.2933 8.37432 21.3291L8.17705 20.1475C7.71347 19.9296 7.27172 19.6741 6.85576 19.3838L5.73369 19.8047C4.81822 20.1475 3.78891 19.7782 3.3001 18.9316L1.64678 16.0684C1.1583 15.2218 1.35319 14.1457 2.10771 13.5244L3.03252 12.7627C3.01137 12.5111 3.00029 12.2567 3.00029 12C3.00029 11.743 3.01132 11.4883 3.03252 11.2363L2.10771 10.4756C1.3532 9.85423 1.15818 8.7782 1.64678 7.93164L3.3001 5.06836C3.78895 4.22191 4.8183 3.85251 5.73369 4.19531L6.85478 4.61523C7.27091 4.32483 7.71325 4.06948 8.17705 3.85156L8.37432 2.6709C8.53518 1.70669 9.3694 1 10.347 1H13.6526C14.6302 1 15.4644 1.70669 15.6253 2.6709L15.8216 3.85059C16.2856 4.06851 16.7276 4.32478 17.1438 4.61523L18.2659 4.19531C19.1813 3.85239 20.2106 4.22194 20.6995 5.06836L22.3528 7.93164C22.8416 8.77828 22.6466 9.85423 21.8919 10.4756L20.9661 11.2363C20.9873 11.4883 21.0003 11.7429 21.0003 12Z"
      fill="currentColor"
    />
  </svg>
);

const AddOnlineOrderingIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      d="M8.99994 14.75C9.82824 14.75 10.4997 15.4217 10.4999 16.25C10.4999 17.0784 9.82837 17.75 8.99994 17.75C8.17159 17.7499 7.49994 17.0784 7.49994 16.25C7.50014 15.4218 8.17172 14.7501 8.99994 14.75Z"
      fill="currentColor"
    />
    <path
      clipRule="evenodd"
      d="M19.412 2.00684C20.2346 2.07513 20.9387 2.64572 21.1689 3.4502L22.5976 8.4502C22.932 9.62048 22.1541 10.7831 20.9999 10.9707V21C20.9999 22.1046 20.1045 23 18.9999 23H4.99994C3.89545 22.9999 2.99994 22.1045 2.99994 21V10.9697C1.84603 10.7818 1.06797 9.62031 1.40228 8.4502L2.83099 3.4502C3.07644 2.59209 3.86132 2.00025 4.75385 2H19.246L19.412 2.00684ZM4.99994 21H12.9999V11H4.99994V21ZM14.9999 21H18.9999V11H14.9999V21ZM3.32611 9H20.6738L19.246 4H4.75385L3.32611 9Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const RequestDeliveryIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      clipRule="evenodd"
      d="M21 11C21 10.7455 20.9514 10.4934 20.857 10.2572L19.6616 7.26874C19.6416 7.21889 19.6213 7.16753 19.6005 7.11489C19.3801 6.55717 19.1033 5.85686 18.6063 5.30994C18.1773 4.83788 17.6417 4.47525 17.0441 4.2523C16.3517 3.99398 15.5987 3.99706 14.999 3.99952C14.9424 3.99975 14.8872 3.99997 14.8335 3.99997H9.16651C9.11282 3.99997 9.05758 3.99975 9.00098 3.99952C8.40128 3.99706 7.64826 3.99398 6.95588 4.2523C6.35828 4.47525 5.82266 4.83788 5.39371 5.30994C4.89673 5.85686 4.61992 6.55716 4.39948 7.11489C4.37867 7.16753 4.35837 7.21889 4.33843 7.26874L3.14305 10.2572C3.04855 10.4934 3 10.7455 3 11V18.5C3 18.9659 3 19.1989 3.07612 19.3827C3.17761 19.6277 3.37229 19.8224 3.61732 19.9238C3.80109 20 4.03406 20 4.5 20C4.96594 20 5.19891 20 5.38268 19.9238C5.62771 19.8224 5.82239 19.6277 5.92388 19.3827C6 19.1989 6 18.9659 6 18.5V18H18V18.5C18 18.9659 18 19.1989 18.0761 19.3827C18.1776 19.6277 18.3723 19.8224 18.6173 19.9238C18.8011 20 19.0341 20 19.5 20C19.9659 20 20.1989 20 20.3827 19.9238C20.6277 19.8224 20.8224 19.6277 20.9239 19.3827C21 19.1989 21 18.9659 21 18.5V11ZM17.1261 6.65496C17.3688 6.92208 17.5141 7.28523 17.8046 8.01152L18.6 9.99997H5.4L6.19538 8.01152C6.4859 7.28523 6.63116 6.92208 6.87389 6.65496C7.08836 6.41893 7.35617 6.23761 7.65497 6.12614C7.99313 5.99997 8.38426 5.99997 9.1665 5.99997H14.8335C15.6157 5.99997 16.0069 5.99997 16.345 6.12614C16.6438 6.23761 16.9116 6.41893 17.1261 6.65496ZM19 13.5C19 14.3284 18.3284 15 17.5 15C16.6716 15 16 14.3284 16 13.5C16 12.6715 16.6716 12 17.5 12C18.3284 12 19 12.6715 19 13.5ZM6.5 15C7.32843 15 8 14.3284 8 13.5C8 12.6715 7.32843 12 6.5 12C5.67157 12 5 12.6715 5 13.5C5 14.3284 5.67157 15 6.5 15Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const AddSolutionsIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      d="M12 7.00001C12.5523 7.00001 13 7.44773 13 8.00001V11H16C16.5523 11 17 11.4477 17 12C17 12.5523 16.5523 13 16 13H13V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V13H8.00001C7.44773 13 7.00001 12.5523 7.00001 12C7.00001 11.4477 7.44773 11 8.00001 11H11V8.00001C11 7.44773 11.4477 7.00001 12 7.00001Z"
      fill="currentColor"
    />
    <path
      clipRule="evenodd"
      d="M15.8638 3.00001C16.3686 2.99995 16.8602 2.99989 17.2765 3.0339C17.7337 3.07125 18.2731 3.15939 18.816 3.43598C19.5686 3.81948 20.1805 4.4314 20.564 5.18405C20.8406 5.7269 20.9288 6.26636 20.9661 6.72355C21.0001 7.13988 21.0001 7.63147 21 8.13625V15.8638C21.0001 16.3685 21.0001 16.8601 20.9661 17.2765C20.9288 17.7337 20.8406 18.2731 20.564 18.816C20.1805 19.5686 19.5686 20.1805 18.816 20.564C18.2731 20.8406 17.7337 20.9288 17.2765 20.9661C16.8601 21.0001 16.3685 21.0001 15.8638 21H8.13625C7.63147 21.0001 7.13988 21.0001 6.72355 20.9661C6.26636 20.9288 5.7269 20.8406 5.18405 20.564C4.4314 20.1805 3.81948 19.5686 3.43598 18.816C3.15939 18.2731 3.07125 17.7337 3.0339 17.2765C2.99989 16.8602 2.99995 16.3686 3.00001 15.8638V8.13622C2.99995 7.63146 2.99989 7.13986 3.0339 6.72355C3.07125 6.26636 3.15939 5.7269 3.43598 5.18405C3.81948 4.4314 4.4314 3.81948 5.18405 3.43598C5.7269 3.15939 6.26636 3.07125 6.72355 3.0339C7.13986 2.99989 7.63143 2.99995 8.13619 3.00001H15.8638ZM5.218 6.09203C5.00001 6.51985 5.00001 7.07991 5.00001 8.20001V15.8C5.00001 16.9201 5.00001 17.4802 5.218 17.908C5.40974 18.2843 5.71571 18.5903 6.09203 18.782C6.51985 19 7.07991 19 8.20001 19H15.8C16.9201 19 17.4802 19 17.908 18.782C18.2843 18.5903 18.5903 18.2843 18.782 17.908C19 17.4802 19 16.9201 19 15.8V8.20001C19 7.07991 19 6.51985 18.782 6.09203C18.5903 5.71571 18.2843 5.40974 17.908 5.218C17.4802 5.00001 16.9201 5.00001 15.8 5.00001H8.20001C7.07991 5.00001 6.51985 5.00001 6.09203 5.218C5.71571 5.40974 5.40974 5.71571 5.218 6.09203Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const HelpIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      d="M12 15.5C12.8284 15.5 13.5 16.1716 13.5 17C13.4999 17.8283 12.8284 18.5 12 18.5C11.1716 18.5 10.5001 17.8283 10.5 17C10.5 16.1716 11.1716 15.5 12 15.5Z"
      fill="currentColor"
    />
    <path
      d="M12.0166 5C14.0648 5.00022 16 6.42635 16 8.81348C15.9997 11.0214 14.3707 12.1482 13.0225 12.6777C12.9823 12.6936 12.9557 12.7176 12.9424 12.7354C12.9315 12.7501 12.9335 12.7535 12.9336 12.748V13.5C12.9334 14.0521 12.4857 14.4999 11.9336 14.5C11.3816 14.4998 10.9338 14.052 10.9336 13.5V12.748C10.9337 11.8254 11.5507 11.1075 12.292 10.8164C13.3481 10.4016 13.9998 9.78708 14 8.81348C14 7.73773 13.179 7.0002 12.0166 7C11.0626 7 10.2361 7.63648 9.96191 8.59961C9.81049 9.13021 9.25734 9.43787 8.72656 9.28711C8.19556 9.13592 7.88719 8.58277 8.03809 8.05176C8.5437 6.27599 10.1212 5 12.0166 5Z"
      fill="currentColor"
    />
    <path
      clipRule="evenodd"
      d="M12 1C18.0751 1 23 5.92487 23 12C22.9999 18.075 18.0751 23 12 23C5.92493 23 1.0001 18.075 1 12C1 5.92487 5.92487 1 12 1ZM12 3C7.02944 3 3 7.02944 3 12C3.0001 16.9705 7.0295 21 12 21C16.9705 21 20.9999 16.9705 21 12C21 7.02944 16.9706 3 12 3Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const TrendingUpIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      d="M16 6L18.29 8.29C18.68 8.68 19.32 8.68 19.71 8.29L21.71 6.29C22.1 5.9 22.1 5.27 21.71 4.88C21.32 4.49 20.68 4.49 20.29 4.88L19 6.17V4C19 3.45 18.55 3 18 3C17.45 3 17 3.45 17 4V8C17 8.55 17.45 9 18 9H22C22.55 9 23 8.55 23 8C23 7.45 22.55 7 22 7H19.41L21.71 4.71C22.1 4.32 22.1 3.68 21.71 3.29C21.32 2.9 20.68 2.9 20.29 3.29L16 7.59V6ZM3 13C3 12.45 3.45 12 4 12C4.55 12 5 12.45 5 13V19C5 19.55 5.45 20 6 20H12C12.55 20 13 19.55 13 19C13 18.45 12.55 18 12 18H7V13C7 12.45 7.45 12 8 12C8.55 12 9 12.45 9 13V19C9 20.1 8.1 21 7 21H3C1.9 21 1 20.1 1 19V13Z"
      fill="currentColor"
    />
  </svg>
);

const FileTextIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z"
      fill="currentColor"
    />
  </svg>
);

const DollarSignIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13.41 16.09V17.5H10.59V16.07C9.86 15.79 9.24 15.26 8.77 14.53L10.23 13.32C10.5 13.75 10.89 14.09 11.35 14.27C11.81 14.45 12.33 14.53 12.94 14.53C13.75 14.53 14.4 14.35 14.89 14C15.38 13.65 15.62 13.18 15.62 12.59C15.62 12.04 15.42 11.59 15.03 11.25C14.64 10.91 14.05 10.66 13.26 10.5L12.5 10.36C11.9 10.25 11.45 10.1 11.15 9.91C10.85 9.72 10.7 9.45 10.7 9.1C10.7 8.7 10.89 8.38 11.27 8.14C11.65 7.9 12.15 7.78 12.78 7.78C13.5 7.78 14.08 7.95 14.52 8.29C14.96 8.63 15.18 9.08 15.18 9.64H16.82C16.82 8.9 16.5 8.28 15.86 7.78C15.22 7.28 14.35 7.03 13.26 7.03V5.5H10.59V7.03C9.78 7.25 9.1 7.66 8.56 8.26C8.02 8.86 7.75 9.58 7.75 10.42H9.39C9.39 9.88 9.58 9.44 9.96 9.1C10.34 8.76 10.85 8.59 11.5 8.59C12.25 8.59 12.82 8.78 13.21 9.16C13.6 9.54 13.79 10.01 13.79 10.57C13.79 11.05 13.64 11.46 13.34 11.8C13.04 12.14 12.58 12.41 11.96 12.61L11.2 12.75C10.4 12.92 9.88 13.13 9.64 13.38C9.4 13.63 9.28 13.96 9.28 14.37C9.28 14.85 9.47 15.25 9.85 15.57C10.23 15.89 10.75 16.05 11.41 16.05V17.5H13.41V16.09Z"
      fill="currentColor"
    />
  </svg>
);

const UserCogIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
      fill="currentColor"
    />
    <path
      d="M19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11.03L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.5 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.5 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11.03C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.95C7.96 18.35 8.52 18.68 9.13 18.93L9.5 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.5 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.95L19.05 18.95C19.27 19.03 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97ZM12 15.5C10.07 15.5 8.5 13.93 8.5 12C8.5 10.07 10.07 8.5 12 8.5C13.93 8.5 15.5 10.07 15.5 12C15.5 13.93 13.93 15.5 12 15.5Z"
      fill="currentColor"
    />
  </svg>
);

const BuildingIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      d="M12 7V3H2V21H22V7H12ZM6 19H4V17H6V19ZM6 15H4V13H6V15ZM6 11H4V9H6V11ZM6 7H4V5H6V7ZM10 19H8V17H10V19ZM10 15H8V13H10V15ZM10 11H8V9H10V11ZM10 7H8V5H10V7ZM20 19H12V17H14V15H12V13H14V11H12V9H14V7H12V5H20V19Z"
      fill="currentColor"
    />
  </svg>
);

const UsersIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"
      fill="currentColor"
    />
  </svg>
);

const MailIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
      fill="currentColor"
    />
  </svg>
);

const CreditCardIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z"
      fill="currentColor"
    />
  </svg>
);

const PlugIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      d="M16 8V2C16 1.45 15.55 1 15 1H9C8.45 1 8 1.45 8 2V8C5.79 8 4 9.79 4 12C4 14.21 5.79 16 8 16V22C8 22.55 8.45 23 9 23H15C15.55 23 16 22.55 16 22V16C18.21 16 20 14.21 20 12C20 9.79 18.21 8 16 8ZM10 3H14V8H10V3ZM14 21H10V16H14V21Z"
      fill="currentColor"
    />
  </svg>
);

const UserIcon = () => (
  <svg
    height="24"
    width="24"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      clipRule="evenodd"
      d="M12 6C14.4851 6.00026 16.5 8.01488 16.5 10.5C16.5 12.9851 14.4851 14.9997 12 15C9.51472 15 7.5 12.9853 7.5 10.5C7.5 8.01472 9.51472 6 12 6ZM12 8C10.6193 8 9.5 9.11929 9.5 10.5C9.5 11.8807 10.6193 13 12 13C13.3805 12.9997 14.5 11.8806 14.5 10.5C14.5 9.11944 13.3805 8.00026 12 8Z"
      fill="currentColor"
      fillRule="evenodd"
    />
    <path
      clipRule="evenodd"
      d="M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM12 18C10.1063 18 8.32448 18.4787 6.76855 19.3213C8.2431 20.3768 10.0483 21 12 21C13.9511 21 15.7552 20.3762 17.2295 19.3213C15.674 18.4791 13.8931 18 12 18ZM12 3C7.02944 3 3 7.02944 3 12C3 14.2621 3.83589 16.328 5.21387 17.9092C7.18914 16.6979 9.51313 16 12 16C14.4863 16 16.8093 16.6984 18.7842 17.9092C20.1627 16.3279 21 14.2625 21 12C21 7.02944 16.9706 3 12 3Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const ChevronDownIcon = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <svg
    className={className}
    style={style}
    height="12"
    width="12"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.793 5.79289C12.1835 5.40237 12.8165 5.40237 13.2071 5.79289C13.5976 6.18342 13.5976 6.81643 13.2071 7.20696L8.70706 11.707C8.31653 12.0975 7.68352 12.0975 7.293 11.707L2.793 7.20696C2.40251 6.81643 2.40248 6.18341 2.793 5.79289C3.18351 5.40242 3.81654 5.40242 4.20706 5.79289L8.00003 9.58586L11.793 5.79289Z"
      fill="currentColor"
    />
  </svg>
);

const ChevronUpIcon = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <svg
    className={className}
    style={style}
    height="12"
    width="12"
    aria-hidden="true"
    fill="none"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.793 5.79289C12.1835 5.40237 12.8165 5.40237 13.2071 5.79289C13.5976 6.18342 13.5976 6.81643 13.2071 7.20696L8.70706 11.707C8.31653 12.0975 7.68352 12.0975 7.293 11.707L2.793 7.20696C2.40251 6.81643 2.40248 6.18341 2.793 5.79289C3.18351 5.40242 3.81654 5.40242 4.20706 5.79289L8.00003 9.58586L11.793 5.79289Z"
      fill="currentColor"
    />
  </svg>
);

interface NavItemProps {
  href?: string;
  label: string;
  active?: boolean;
  icon?: React.ComponentType<any>;
  isSubItem?: boolean;
  onClick?: () => void;
  hasChevron?: boolean;
  chevronExpanded?: boolean;
  highlightBlue?: boolean;
}

function NavItem({
  href,
  label,
  active,
  icon: Icon,
  isSubItem = false,
  onClick,
  hasChevron = false,
  chevronExpanded = false,
  highlightBlue = false,
}: NavItemProps) {
  const baseClasses =
    'flex items-stretch justify-start flex-row whitespace-normal rounded-lg cursor-pointer text-sm';
  const paddingClasses = isSubItem
    ? 'pl-[calc(48px-4px)] pr-0 py-1 min-h-[28px]'
    : 'px-2 py-2 min-h-[36px]';
  const marginClasses = isSubItem ? 'mx-4' : 'mx-4 mb-1';

  // Color classes based on active state
  let colorClasses = isSubItem ? 'text-[#767676]' : 'text-[#494949]';
  if (active && highlightBlue) {
    colorClasses = 'text-[#0066cc]';
  } else if (active && !isSubItem) {
    colorClasses = 'text-[#494949]';
  }

  // Background classes for active state - blue tint instead of red
  const activeBgClasses = active && !isSubItem && highlightBlue ? 'bg-[#e6f2ff]' : '';

  const content = (
    <>
      {Icon && (
        <div
          className="flex-shrink-0"
          style={{ color: active && highlightBlue ? '#0066cc' : 'currentColor' }}
        >
          <Icon />
        </div>
      )}
      <div
        className="flex flex-row items-center flex-1 flex-wrap"
        style={{ marginLeft: Icon ? '12px' : '0' }}
      >
        <div className="flex items-center justify-start flex-row">
          <span>{label}</span>
          {hasChevron && (
            <div className="flex-shrink-0 ml-1.5">
              {chevronExpanded ? (
                <ChevronDownIcon
                  className="flex-shrink-0"
                  style={{ color: active && highlightBlue ? '#0066cc' : '#767676' }}
                />
              ) : (
                <ChevronUpIcon
                  className="flex-shrink-0"
                  style={{ color: active && highlightBlue ? '#0066cc' : '#767676' }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <div
        onClick={onClick}
        className={`${baseClasses} ${paddingClasses} ${marginClasses} ${colorClasses} ${activeBgClasses}`}
        role="button"
        tabIndex={0}
      >
        {content}
      </div>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className={`${baseClasses} ${paddingClasses} ${marginClasses} ${colorClasses} ${activeBgClasses}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={`${baseClasses} ${paddingClasses} ${marginClasses} ${colorClasses} ${activeBgClasses}`}
    >
      {content}
    </div>
  );
}

export default function MerchantSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentStoreId: contextStoreId } = useCurrentStore();
  const { data: allRestaurants, isLoading: isLoadingRestaurants } = useAllRestaurants();

  // Get current merchant for displaying name and filtering stores
  const currentMerchant = useMerchantAuthStore(state => state.currentMerchant);
  const signOut = useMerchantAuthStore(state => state.signOut);

  // Filter restaurants to only show stores belonging to the current merchant
  const restaurants = useMemo(() => {
    if (!allRestaurants || !currentMerchant?.storeIds) return allRestaurants;
    return allRestaurants.filter(r => currentMerchant.storeIds.includes(r.id));
  }, [allRestaurants, currentMerchant?.storeIds]);

  // Display name is the user's full name
  const userDisplayName = useMemo(() => {
    if (!currentMerchant?.firstName) return 'Merchant';
    return `${currentMerchant.firstName} ${currentMerchant.lastName}`;
  }, [currentMerchant?.firstName, currentMerchant?.lastName]);

  // Auto-expand based on current pathname
  const [settingsExpanded, setSettingsExpanded] = useState(
    pathname?.startsWith('/merchant/settings') || false
  );
  const [customersExpanded, setCustomersExpanded] = useState(
    (pathname?.startsWith('/merchant/store/') && pathname?.includes('/customers')) ||
      pathname?.startsWith('/merchant/customers') ||
      false
  );
  const [financialsExpanded, setFinancialsExpanded] = useState(
    pathname?.startsWith('/merchant/financials') || false
  );
  const [insightsExpanded, setInsightsExpanded] = useState(
    pathname?.startsWith('/merchant/insights') || false
  );
  const [menuExpanded, setMenuExpanded] = useState(
    pathname?.startsWith('/merchant/menu') ||
      (pathname?.startsWith('/merchant/store/') && pathname?.includes('/menu')) ||
      false
  );
  const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Handle logout - use replace for immediate redirect
  const handleLogout = () => {
    signOut();
    router.replace('/merchant/auth');
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Extract store ID from URL if we're on /merchant/store/[id] route
  const urlStoreId = useMemo(() => {
    if (pathname?.startsWith('/merchant/store/')) {
      const match = pathname.match(/\/merchant\/store\/([^\/]+)/);
      return match ? match[1] : null;
    }
    return null;
  }, [pathname]);

  // Use URL store ID as source of truth if available, otherwise use context
  const effectiveStoreId = urlStoreId || contextStoreId;

  // Find the current store
  const currentStore = useMemo(() => {
    if (!restaurants) return null;

    if (urlStoreId) {
      const store = restaurants.find(r => r.id === urlStoreId);
      if (store) return store;
    }

    if (contextStoreId) {
      const store = restaurants.find(r => r.id === contextStoreId);
      if (store) return store;
    }

    return restaurants[0] || null;
  }, [restaurants, urlStoreId, contextStoreId]);

  // Build menu URLs with store ID
  const homeUrl = effectiveStoreId ? `/merchant/store/${effectiveStoreId}` : '/merchant';
  const insightsOptimizationUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/insights/optimization-score`
    : '/merchant/insights/optimization-score';
  const insightsSalesUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/insights/sales`
    : '/merchant/insights/sales';
  const insightsProductMixUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/insights/product-mix`
    : '/merchant/insights/product-mix';
  const insightsOperationsUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/insights/operations-quality`
    : '/merchant/insights/operations-quality';
  const reportsUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/reports`
    : '/merchant/reports';
  const customersInsightsUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/customers/insights`
    : '/merchant/customers/insights';
  const customersRatingsUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/customers/ratings-reviews`
    : '/merchant/customers/ratings-reviews';
  const ordersUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/orders`
    : '/merchant/orders';
  const menuManagerUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/menu`
    : '/merchant/menu';
  const menuPricingUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/menu/pricing`
    : '/merchant/menu/pricing';
  const storeAvailabilityUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/store-availability`
    : '/merchant/store-availability';
  const financialsTransactionsUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/financials/transactions`
    : '/merchant/financials/transactions';
  const financialsPayoutsUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/financials/payouts`
    : '/merchant/financials/payouts';
  const financialsStatementsUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/financials/statements`
    : '/merchant/financials/statements';
  const settingsAccountUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/settings/account`
    : '/merchant/settings/account';
  const settingsPricingUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/settings/pricing`
    : '/merchant/settings/pricing';
  const settingsStoreUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/settings/store`
    : '/merchant/settings/store';
  const usersUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/users`
    : '/merchant/users';
  const settingsStoreCommUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/settings/store-communications`
    : '/merchant/settings/store-communications';
  const settingsBankUrl = effectiveStoreId
    ? `/merchant/store/${effectiveStoreId}/settings/bank-account`
    : '/merchant/settings/bank-account';

  const isHomeActive = pathname === homeUrl || pathname === '/merchant';
  const isInsightsActive =
    pathname?.startsWith('/merchant/insights') ||
    (pathname?.startsWith('/merchant/store/') && pathname?.includes('/insights'));
  const isCustomersActive =
    pathname?.startsWith('/merchant/customers') ||
    (pathname?.startsWith('/merchant/store/') && pathname?.includes('/customers'));
  const isCustomersInsightsActive =
    pathname === customersInsightsUrl ||
    (pathname?.startsWith('/merchant/store/') && pathname?.endsWith('/customers/insights'));
  const isReportsActive =
    pathname === reportsUrl ||
    pathname?.startsWith('/merchant/reports') ||
    (pathname?.startsWith('/merchant/store/') && pathname?.includes('/reports'));
  const isOrdersActive =
    pathname === ordersUrl ||
    pathname?.startsWith('/merchant/orders') ||
    (pathname?.startsWith('/merchant/store/') && pathname?.includes('/orders'));
  const isMenuActive =
    pathname === menuManagerUrl ||
    pathname?.startsWith('/merchant/menu') ||
    (pathname?.startsWith('/merchant/store/') && pathname?.includes('/menu'));
  const isStoreAvailabilityActive =
    pathname === storeAvailabilityUrl ||
    pathname?.startsWith('/merchant/store-availability') ||
    (pathname?.startsWith('/merchant/store/') && pathname?.includes('/store-availability'));
  const isFinancialsActive =
    pathname?.startsWith('/merchant/financials') ||
    (pathname?.startsWith('/merchant/store/') && pathname?.includes('/financials'));
  const isSettingsActive =
    pathname?.startsWith('/merchant/settings') ||
    (pathname?.startsWith('/merchant/store/') && pathname?.includes('/settings'));

  return (
    <>
      <aside
        className="fixed left-0 top-0 bottom-0 w-[256px] border-r border-[#e7e7e7] bg-white overflow-hidden flex flex-col"
        style={{
          scrollbarWidth: 'none',
          userSelect: 'none',
          overflowX: 'hidden',
        }}
      >
        <ul
          className="flex flex-col justify-start w-[256px] h-full m-0 p-0 list-none relative"
          style={{ overflowX: 'hidden' }}
        >
          {/* Logo Section */}
          <div className="p-3">
            <Link href={homeUrl} className="block">
              <div className="p-3 flex items-center justify-start flex-row">
                <div className="flex items-center justify-start flex-row">
                  <svg
                    height="16"
                    width="28"
                    aria-hidden="true"
                    fill="#0066cc"
                    viewBox="0 0 99.5 56.5"
                    className="overflow-hidden"
                  >
                    <path d="M95.64,13.38A25.24,25.24,0,0,0,73.27,0H2.43A2.44,2.44,0,0,0,.72,4.16L16.15,19.68a7.26,7.26,0,0,0,5.15,2.14H71.24a6.44,6.44,0,1,1,.13,12.88H36.94a2.44,2.44,0,0,0-1.72,4.16L50.66,54.39a7.25,7.25,0,0,0,5.15,2.14H71.38c20.26,0,35.58-21.66,24.26-43.16" />
                  </svg>
                  <span className="sr-only">DoorDash</span>
                </div>
                <span
                  className="ml-2 text-lg font-bold text-gray-900"
                  style={{ fontSize: '18px', lineHeight: '20px', letterSpacing: '-0.01px' }}
                >
                  Merchant
                </span>
              </div>
            </Link>
          </div>

          {/* Store Selector */}
          <div className="mx-2 mb-6" style={{ marginTop: 'calc(4px * 5)' }}>
            <button
              onClick={() => setIsStoreSelectorOpen(true)}
              className="w-full flex items-center px-3 py-2 rounded-full hover:bg-gray-50 transition-colors text-left"
              disabled={isLoadingRestaurants || !currentStore}
              style={{
                minHeight: '40px',
              }}
            >
              {/* Status indicator */}
              <div className="flex-shrink-0 mr-3">
                <img
                  height={16}
                  width={16}
                  alt="Store status"
                  src="/status-inactive.svg"
                  className="h-4 w-4"
                />
              </div>

              {/* Store name and label */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span
                    className="font-bold text-gray-900 break-words"
                    style={{
                      fontSize: '20px',
                      lineHeight: '24px',
                      letterSpacing: '-0.01px',
                      fontWeight: 700,
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                    }}
                  >
                    {isLoadingRestaurants
                      ? 'Loading...'
                      : currentStore?.name || 'No store selected'}
                  </span>
                  <svg
                    className="flex-shrink-0 mt-0.5"
                    height="12"
                    width="12"
                    aria-hidden="false"
                    fill="none"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Open store selector</title>
                    <path
                      d="M11.793 5.79289C12.1835 5.40237 12.8165 5.40237 13.2071 5.79289C13.5976 6.18342 13.5976 6.81643 13.2071 7.20696L8.70706 11.707C8.31653 12.0975 7.68352 12.0975 7.293 11.707L2.793 7.20696C2.40251 6.81643 2.40248 6.18341 2.793 5.79289C3.18351 5.40242 3.81654 5.40242 4.20706 5.79289L8.00003 9.58586L11.793 5.79289Z"
                      fill="currentColor"
                      style={{ color: '#191919' }}
                    />
                  </svg>
                </div>
                <span
                  className="text-gray-900 block"
                  style={{
                    fontSize: '14px',
                    lineHeight: '20px',
                    letterSpacing: '0px',
                    fontWeight: 400,
                  }}
                >
                  Store
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Items */}
          <div
            className="flex-1 overflow-y-auto overflow-x-hidden"
            style={{ overflowX: 'hidden', width: '256px' }}
          >
            <div className="w-[256px]" style={{ overflowX: 'hidden' }}>
              {/* Home */}
              <NavItem href={homeUrl} label="Home" active={isHomeActive} icon={HomeIcon} />

              {/* Insights */}
              <div className="w-[256px]">
                <NavItem
                  label="Insights"
                  active={isInsightsActive}
                  icon={InsightsIcon}
                  hasChevron
                  chevronExpanded={insightsExpanded}
                  onClick={() => setInsightsExpanded(!insightsExpanded)}
                />
                {insightsExpanded && (
                  <>
                    <NavItem
                      href={insightsOptimizationUrl}
                      label="Optimization score"
                      active={
                        pathname === insightsOptimizationUrl ||
                        (pathname?.startsWith('/merchant/store/') &&
                          pathname?.includes('/insights/optimization-score'))
                      }
                      isSubItem
                    />
                    <NavItem
                      href={insightsSalesUrl}
                      label="Sales"
                      active={
                        pathname === insightsSalesUrl ||
                        (pathname?.startsWith('/merchant/store/') &&
                          pathname?.includes('/insights/sales'))
                      }
                      isSubItem
                    />
                    <NavItem
                      href={insightsProductMixUrl}
                      label="Product mix"
                      active={
                        pathname === insightsProductMixUrl ||
                        (pathname?.startsWith('/merchant/store/') &&
                          pathname?.includes('/insights/product-mix'))
                      }
                      isSubItem
                    />
                    <NavItem
                      href={insightsOperationsUrl}
                      label="Operations quality"
                      active={
                        pathname === insightsOperationsUrl ||
                        (pathname?.startsWith('/merchant/store/') &&
                          pathname?.includes('/insights/operations-quality'))
                      }
                      isSubItem
                    />
                  </>
                )}
              </div>

              {/* Reports */}
              <NavItem
                href={reportsUrl}
                label="Reports"
                active={isReportsActive}
                icon={ReportsIcon}
              />

              {/* Customers */}
              <div className="w-[256px]">
                <NavItem
                  label="Customers"
                  active={isCustomersActive}
                  icon={CustomersIcon}
                  hasChevron
                  chevronExpanded={customersExpanded}
                  highlightBlue={isCustomersActive}
                  onClick={() => setCustomersExpanded(!customersExpanded)}
                />
                {customersExpanded && (
                  <>
                    <NavItem
                      href={customersInsightsUrl}
                      label="Customer insights"
                      active={isCustomersInsightsActive}
                      isSubItem
                    />
                    <NavItem
                      href={customersRatingsUrl}
                      label="Ratings & reviews"
                      active={
                        pathname === customersRatingsUrl ||
                        (pathname?.startsWith('/merchant/store/') &&
                          pathname?.includes('/customers/ratings-reviews'))
                      }
                      isSubItem
                    />
                  </>
                )}
              </div>

              {/* Orders */}
              <NavItem href={ordersUrl} label="Orders" active={isOrdersActive} icon={OrdersIcon} />

              {/* Menu */}
              <div className="w-[256px]">
                <NavItem
                  label="Menu"
                  active={isMenuActive}
                  icon={MenuIcon}
                  hasChevron
                  chevronExpanded={menuExpanded}
                  onClick={() => setMenuExpanded(!menuExpanded)}
                />
                {menuExpanded && (
                  <>
                    <NavItem
                      href={menuManagerUrl}
                      label="Menu Manager"
                      active={
                        pathname === menuManagerUrl ||
                        (pathname?.startsWith('/merchant/store/') &&
                          pathname?.endsWith('/menu') &&
                          !pathname?.includes('/menu/pricing'))
                      }
                      isSubItem
                    />
                    <NavItem
                      href={menuPricingUrl}
                      label="Pricing"
                      active={
                        pathname === menuPricingUrl ||
                        (pathname?.startsWith('/merchant/store/') &&
                          pathname?.includes('/menu/pricing'))
                      }
                      isSubItem
                    />
                  </>
                )}
              </div>

              {/* Store Availability */}
              <NavItem
                href={storeAvailabilityUrl}
                label="Store availability"
                active={isStoreAvailabilityActive}
                icon={StoreAvailabilityIcon}
              />

              {/* Financials */}
              <div className="w-[256px]">
                <NavItem
                  label="Financials"
                  active={isFinancialsActive}
                  icon={FinancialsIcon}
                  hasChevron
                  chevronExpanded={financialsExpanded}
                  onClick={() => setFinancialsExpanded(!financialsExpanded)}
                />
                {financialsExpanded && (
                  <>
                    <NavItem
                      href={financialsTransactionsUrl}
                      label="Transactions"
                      active={
                        pathname === financialsTransactionsUrl ||
                        (pathname?.startsWith('/merchant/store/') &&
                          pathname?.includes('/financials/transactions'))
                      }
                      isSubItem
                    />
                    <NavItem
                      href={financialsPayoutsUrl}
                      label="Payouts"
                      active={
                        pathname === financialsPayoutsUrl ||
                        (pathname?.startsWith('/merchant/store/') &&
                          pathname?.includes('/financials/payouts'))
                      }
                      isSubItem
                    />
                    <NavItem
                      href={financialsStatementsUrl}
                      label="Statements"
                      active={
                        pathname === financialsStatementsUrl ||
                        (pathname?.startsWith('/merchant/store/') &&
                          pathname?.includes('/financials/statements'))
                      }
                      isSubItem
                    />
                  </>
                )}
              </div>

              {/* Settings */}
              <div className="w-[256px]">
                <NavItem
                  label="Settings"
                  active={isSettingsActive}
                  icon={SettingsIcon}
                  hasChevron
                  chevronExpanded={settingsExpanded}
                  onClick={() => setSettingsExpanded(!settingsExpanded)}
                />
                {settingsExpanded && (
                  <>
                    <NavItem
                      href={settingsAccountUrl}
                      label="Account settings"
                      active={
                        pathname === settingsAccountUrl ||
                        (pathname?.startsWith('/merchant/store/') &&
                          pathname?.includes('/settings/account'))
                      }
                      isSubItem
                    />
                    <NavItem
                      href={settingsPricingUrl}
                      label="Pricing plans"
                      active={
                        pathname === settingsPricingUrl ||
                        (pathname?.startsWith('/merchant/store/') &&
                          pathname?.includes('/settings/pricing'))
                      }
                      isSubItem
                    />
                    <NavItem
                      href={settingsStoreUrl}
                      label="Store settings"
                      active={
                        pathname === settingsStoreUrl ||
                        (pathname?.startsWith('/merchant/store/') &&
                          pathname?.includes('/settings/store'))
                      }
                      isSubItem
                    />
                    <NavItem
                      href={usersUrl}
                      label="Manage Users"
                      active={
                        pathname === usersUrl ||
                        (pathname?.startsWith('/merchant/store/') &&
                          pathname?.includes('/users')) ||
                        pathname?.startsWith('/merchant/users') ||
                        false
                      }
                      isSubItem
                    />
                    <NavItem
                      href={settingsStoreCommUrl}
                      label="Store communications"
                      active={
                        pathname === settingsStoreCommUrl ||
                        (pathname?.startsWith('/merchant/store/') &&
                          pathname?.includes('/settings/store-communications'))
                      }
                      isSubItem
                    />
                    <NavItem
                      href={settingsBankUrl}
                      label="Bank account"
                      active={
                        pathname === settingsBankUrl ||
                        (pathname?.startsWith('/merchant/store/') &&
                          pathname?.includes('/settings/bank-account'))
                      }
                      isSubItem
                    />
                    <NavItem href="#" label="Integrations" active={false} isSubItem />
                  </>
                )}
              </div>
            </div>

            {/* Channels Section */}
            <div className="w-[256px]">
              <div
                className="px-6 py-2 text-sm text-[#606060] font-normal"
                style={{ fontSize: '14px', lineHeight: '20px', letterSpacing: '0px' }}
              >
                Channels
              </div>
              <NavItem
                href={
                  effectiveStoreId
                    ? `/merchant/store/${effectiveStoreId}/storefront`
                    : '/merchant/storefront'
                }
                label="Add Online Ordering"
                icon={AddOnlineOrderingIcon}
              />
              <NavItem
                href={
                  effectiveStoreId
                    ? `/merchant/store/${effectiveStoreId}/request-delivery`
                    : '/merchant/request-delivery'
                }
                label="Request a delivery"
                icon={RequestDeliveryIcon}
              />
            </div>

            {/* Divider */}
            <div className="w-full px-6 my-6">
              <hr className="border-t border-[#e7e7e7] h-px m-0" />
            </div>

            {/* Add Solutions */}
            <div className="w-[256px]">
              <NavItem
                href={
                  effectiveStoreId
                    ? `/merchant/store/${effectiveStoreId}/solutions`
                    : '/merchant/solutions'
                }
                label="Add solutions"
                icon={AddSolutionsIcon}
              />
            </div>

            {/* Help */}
            <div className="w-[256px]">
              <NavItem href="#" label="Help" icon={HelpIcon} />
            </div>

            <div className="mb-3" />
          </div>

          {/* User Profile Section */}
          <div
            ref={profileDropdownRef}
            className="flex flex-col justify-end pt-4 relative"
            style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 4px 16px' }}
          >
            {/* Profile Dropdown */}
            {isProfileDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 mx-2 bg-white border border-[#e7e7e7] rounded-lg shadow-lg z-50">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm text-gray-900 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                >
                  <svg
                    height="20"
                    width="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 17L21 12L16 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 12H9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Log out
                </button>
              </div>
            )}
            <div className="flex">
              <div
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex-1 border border-[#e7e7e7] rounded-lg p-2 flex flex-row items-center cursor-pointer mx-0 mb-0 ml-0 hover:bg-gray-50 transition-colors"
                style={{
                  minHeight: '36px',
                  lineHeight: '20px',
                  fontSize: '14px',
                  color: '#606060',
                }}
                aria-expanded={isProfileDropdownOpen}
              >
                <div className="mr-2 h-6">
                  <UserIcon />
                </div>
                <div className="flex-1 mr-2">
                  <span
                    className="text-sm text-gray-900 font-normal"
                    style={{ fontSize: '14px', lineHeight: '20px', letterSpacing: '-0.01px' }}
                  >
                    {userDisplayName}
                  </span>
                </div>
                <svg
                  height="24"
                  width="24"
                  aria-hidden="true"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`flex-shrink-0 transition-transform ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`}
                >
                  <path
                    d="M17.793 8.79289C18.1835 8.40242 18.8166 8.4025 19.2071 8.79289C19.5976 9.18342 19.5976 9.81644 19.2071 10.207L12.7071 16.707C12.3166 17.0975 11.6835 17.0975 11.293 16.707L4.79302 10.207C4.40249 9.81643 4.40249 9.18342 4.79302 8.79289C5.18354 8.40237 5.81655 8.40237 6.20708 8.79289L12 14.5859L17.793 8.79289Z"
                    fill="currentColor"
                    style={{ color: '#191919' }}
                  />
                </svg>
              </div>
            </div>
          </div>
        </ul>
      </aside>

      {/* Store Selector */}
      <StoreSelector
        isOpen={isStoreSelectorOpen}
        onClose={() => setIsStoreSelectorOpen(false)}
        restaurants={restaurants || []}
        isLoading={isLoadingRestaurants}
      />
    </>
  );
}
