This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Mobile App (Android)

This project uses [Capacitor](https://capacitorjs.com) to bundle the PWA as a native Android app. ### 📱 Android App (Capacitor)
- Native wrapper loading `https://uniwersitet-kontrolle.web.app`
), ensuring that users always see the latest version without needing app store updates.

### Prerequisites
- Android Studio installed
- Java JDK installed

### Setup & Build

1. **Sync Config**: If you change `capacitor.config.ts`, sync the changes to the Android project:
   ```bash
   npx cap sync
   ```

2. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

3. **Run**:
   - Connect an Android device or start an emulator.
   - Click the "Run" (Play) button in Android Studio.

### Notes
- The app requires an internet connection on the first launch to cache resources.
- After the first load, the PWA Service Worker handles offline support.
- The app ID is `com.edu.app`.
