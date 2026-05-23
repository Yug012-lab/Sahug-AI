export const metadata = {
  title: 'SahugAI — Cinematic AI Platform',
  description: 'A world-class cinematic AI experience. The Void & The Neon.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#050505' }}>
        {children}
      </body>
    </html>
  )
}
