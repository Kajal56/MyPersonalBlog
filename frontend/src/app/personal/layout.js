import PersonalTabs from '../../components/PersonalTabs'

// Shared so the tab bar persists across tab switches and its highlight can glide
export default function PersonalLayout({ children }) {
  return (
    <>
      <PersonalTabs />
      {children}
    </>
  )
}
