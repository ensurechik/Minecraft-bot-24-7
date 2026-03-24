import "./globals.css";

export const metadata = {
  title: "MC Bot Dashboard",
  description: "Minecraft Bot Control Panel by TerrorAqua",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="scan-line" />
        {children}
      </body>
    </html>
  );
}
