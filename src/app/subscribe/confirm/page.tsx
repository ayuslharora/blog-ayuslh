import ConfirmSubscription from '../../../components/ConfirmSubscription';

export const metadata = {
  title: 'Confirm subscription',
  robots: { index: false, follow: false },
};

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  return (
    <div className="max-w-xl mx-auto px-6 pb-20 pt-10 md:pt-16">
      <ConfirmSubscription token={typeof token === 'string' ? token : ''} />
    </div>
  );
}
