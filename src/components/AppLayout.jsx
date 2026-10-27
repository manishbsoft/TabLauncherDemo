export function AppLayout({ children, sidebar }) {
  return (
    <div className="app-shell">
      <main className="workspace-main">{children}</main>
      {sidebar}
    </div>
  )
}
