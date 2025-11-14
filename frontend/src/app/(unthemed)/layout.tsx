import '../globals.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className='min-w-[600px]'>{children}</div>;
}
