import type { Metadata } from 'next';
import { MenuList } from './MenuList';

export const metadata: Metadata = {
  title: 'Menu List',
  description: 'List of menu items.',
};

type PageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ id?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { category } = await params;
  const { id } = await searchParams;
  const categoryId = id || '0';

  return <MenuList category={category} category_id={parseInt(categoryId)} />;
}