function App() {
  return (
    <main style={{ fontFamily: 'system-ui', padding: '2rem', maxWidth: 640 }}>
      <h1>Encurtador</h1>
      <p>
        Esqueleto Vite + React. A API Nest está em outro processo (ex.:{' '}
        <code>http://localhost:3000</code>); em dev o Vite repassa{' '}
        <code>/api</code> via proxy (veja <code>vite.config.ts</code>).
      </p>
    </main>
  );
}

export default App;
