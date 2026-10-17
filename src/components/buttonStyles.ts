const BUTTON_BASE = 'rounded-full px-4 py-2 text-[15px] font-bold transition-colors disabled:opacity-50'

export const buttonStyles = {
  primary: `${BUTTON_BASE} bg-fg text-bg hover:opacity-90`,
  secondary: `${BUTTON_BASE} border border-border hover:bg-hover`,
  danger: `${BUTTON_BASE} bg-red-600 text-white hover:bg-red-700`,
}
