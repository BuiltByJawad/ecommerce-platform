import ReduxWrapper from "./reduxWrapper";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import LoadingProvider from "@/utils/LoadingProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="colorScheme">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, user-scalable=no"
      />
      <body>
        <div>
          <ReduxWrapper>
            <LoadingProvider>{children}</LoadingProvider>
          </ReduxWrapper>
        </div>
      </body>
    </html>
  );
}
