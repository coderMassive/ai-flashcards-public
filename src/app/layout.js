import { Inter } from "next/font/google";
import {
  ClerkProvider,
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Flashcard AI",
  description: "AI generating flashcards",
};

const userButtonAppearance = {
  elements: {
    userButtonAvatarBox: "w-12 h-12",
  },
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <nav className="flex items-center justify-between flex-wrap p-6">
        <div className="flex items-center flex-shrink-0 text-white mr-6">
          <a href="/" className="font-semibold text-xl tracking-tight">
            Flashcards
          </a>
        </div>
        <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
          <div className="text-sm lg:flex-grow">
            <a href="/sets" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
              Sets
            </a>
            <a href="#responsive-header" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-4">
              Examples
            </a>
            <a href="#responsive-header" className="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white">
              Blog
            </a>
          </div>
          <div>
          </div>
        </div>
      </nav>
      <ClerkProvider
              appearance={{
                baseTheme: dark,
              }}
            >
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
          <SignedIn>
            <div className="absolute top-0 right-0 mt-3 mr-9">
              <UserButton appearance={userButtonAppearance}/>
            </div>
          </SignedIn>
          {children}
      </ClerkProvider>  
      </body>
    </html>
  )
}