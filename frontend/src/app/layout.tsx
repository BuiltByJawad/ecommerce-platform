import ReduxWrapper from './reduxWrapper';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import LoadingProvider from '@/utils/LoadingProvider';
import ErrorBoundary from './(components)/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className='colorScheme'>
      <meta name='viewport' content='width=device-width, initial-scale=1.0, user-scalable=no' />
      <body>
        <ErrorBoundary>
          <div>
            <ReduxWrapper>
              <LoadingProvider>{children}</LoadingProvider>
            </ReduxWrapper>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
