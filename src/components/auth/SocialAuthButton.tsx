import React from 'react';

interface SocialAuthButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

export const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({
  onClick,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      className="social-auth-btn"
      disabled={disabled}
      onClick={onClick}
      aria-label="Continue with Google"
      title="Sign in with your Google account"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M12 5c1.56 0 2.97.55 4.08 1.45l3.06-3.06C17.29 1.63 14.83 1 12 1 7.5 1 3.65 3.56 1.77 7.28l3.66 2.84C6.31 7.26 8.92 5 12 5z"
        />
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.68 2.86c2.14-1.98 3.74-4.89 3.74-8.68z"
        />
        <path
          fill="#FBBC05"
          d="M5.43 14.88c-.24-.71-.37-1.46-.37-2.24s.13-1.53.37-2.24L1.77 7.56C.64 9.8 0 12.32 0 15s.64 5.2 1.77 7.44l3.66-2.84z"
        />
        <path
          fill="#34A853"
          d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.68-2.86c-1.07.72-2.45 1.16-4.25 1.16-3.08 0-5.69-2.26-6.57-5.12L1.77 16.11C3.65 19.83 7.5 23 12 23z"
        />
      </svg>
      <span>Continue with Google</span>
    </button>
  );
};
