import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Page Title', // Will render as "Page Title | Dashboard App"
    description: 'Page specific description',
  };
}
