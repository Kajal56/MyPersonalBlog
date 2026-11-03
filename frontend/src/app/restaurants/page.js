import { redirect } from 'next/navigation'

// Old URL from before the Personal section; kept so existing links still work
export default function LegacyRestaurantsPage() {
  redirect('/personal/restaurants')
}
