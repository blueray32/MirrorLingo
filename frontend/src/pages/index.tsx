import dynamic from 'next/dynamic';
import Head from 'next/head';

// Import the main Home content without SSR to prevent hydration errors
const HomeContent = dynamic(
  () => import('../components/HomeContent').then(mod => mod.HomeContent),
  { ssr: false }
);

export default function Home() {
  return (
    <>
      <Head>
        <title>MirrorLingo - Your Personal Spanish Learning Coach</title>
        <meta name="description" content="Learn Spanish based on your unique speaking style and daily phrases" />
      </Head>
      <HomeContent />
    </>
  );
}
