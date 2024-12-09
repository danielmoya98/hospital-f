import "./globals.css";
import {EmployeeProvider} from "@/context/EmployeeContext";

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body>
        <EmployeeProvider>{children}</EmployeeProvider>
        </body>
        </html>
    );
}
