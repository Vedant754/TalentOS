const IconBase = ({ children, ...props }) => (
  <svg
    aria-hidden="true"
    fill="none"
    height="1em"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    {children}
  </svg>
);

export const AlertCircleIcon = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v5" />
    <path d="M12 17h.01" />
  </IconBase>
);

export const ArrowRightIcon = (props) => (
  <IconBase {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </IconBase>
);

export const BriefcaseIcon = (props) => (
  <IconBase {...props}>
    <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
    <rect height="14" rx="2" width="18" x="3" y="6" />
    <path d="M3 12h18" />
  </IconBase>
);

export const CalendarIcon = (props) => (
  <IconBase {...props}>
    <rect height="18" rx="2" width="18" x="3" y="4" />
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <path d="M3 10h18" />
  </IconBase>
);

export const CheckIcon = (props) => (
  <IconBase {...props}>
    <path d="m20 6-11 11-5-5" />
  </IconBase>
);

export const CheckCircleIcon = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-5" />
  </IconBase>
);

export const ClockIcon = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </IconBase>
);

export const GridIcon = (props) => (
  <IconBase {...props}>
    <rect height="7" width="7" x="3" y="3" />
    <rect height="7" width="7" x="14" y="3" />
    <rect height="7" width="7" x="14" y="14" />
    <rect height="7" width="7" x="3" y="14" />
  </IconBase>
);

export const InboxIcon = (props) => (
  <IconBase {...props}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="m5.5 5-3 7v6a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2v-6l-3-7Z" />
  </IconBase>
);

export const LockIcon = (props) => (
  <IconBase {...props}>
    <rect height="11" rx="2" width="18" x="3" y="11" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </IconBase>
);

export const LogOutIcon = (props) => (
  <IconBase {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </IconBase>
);

export const MailIcon = (props) => (
  <IconBase {...props}>
    <rect height="16" rx="2" width="20" x="2" y="4" />
    <path d="m22 7-10 6L2 7" />
  </IconBase>
);

export const MoonIcon = (props) => (
  <IconBase {...props}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
  </IconBase>
);

export const PieChartIcon = (props) => (
  <IconBase {...props}>
    <path d="M21 12a9 9 0 1 1-9-9v9Z" />
    <path d="M12 3a9 9 0 0 1 9 9h-9Z" />
  </IconBase>
);

export const SearchIcon = (props) => (
  <IconBase {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </IconBase>
);

export const SendIcon = (props) => (
  <IconBase {...props}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </IconBase>
);

export const ShieldIcon = (props) => (
  <IconBase {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
  </IconBase>
);

export const SunIcon = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </IconBase>
);

export const TrashIcon = (props) => (
  <IconBase {...props}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="m19 6-1 14H6L5 6" />
    <path d="M10 11v5" />
    <path d="M14 11v5" />
  </IconBase>
);

export const TrendingUpIcon = (props) => (
  <IconBase {...props}>
    <path d="m3 17 6-6 4 4 8-8" />
    <path d="M14 7h7v7" />
  </IconBase>
);

export const UserIcon = (props) => (
  <IconBase {...props}>
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </IconBase>
);

export const UserCheckIcon = (props) => (
  <IconBase {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="m16 11 2 2 4-5" />
  </IconBase>
);

export const UserPlusIcon = (props) => (
  <IconBase {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M19 8v6" />
    <path d="M22 11h-6" />
  </IconBase>
);

export const UsersIcon = (props) => (
  <IconBase {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </IconBase>
);
