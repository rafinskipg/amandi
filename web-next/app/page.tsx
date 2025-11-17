import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to Spanish by default
  redirect('/es')
}
