export default function NotFound() {
  return (
    <div
      style={{
        background: '#f0f0f0',
        color: '#333',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
      className='w-full'
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>404</h1>
      <p style={{ fontSize: '1.2rem' }}>This page could not be found.</p>
    </div>
  );
}
