import SecretMessageView from '@/components/SecretMessageView';

interface SecretMessageSingleViewPageProps {
  params: Promise<{ uuid: string }>;
}

const SecretMessageSingleViewPage = async ({
  params,
}: SecretMessageSingleViewPageProps) => {
  const secretHostName = process.env.NEXT_PUBLIC_SECRETMESSAGE_HOSTNAME;
  const { uuid } = await params;
  const response = await fetch(`${secretHostName}/api/Secret/${uuid}`, {
    cache: 'no-store',
  });
  const data = await response.json();
  const secretMessage = data.status === 404 ? null : data;
  return (
    <div>
      <SecretMessageView secretMessage={secretMessage} />
    </div>
  );
};

export default SecretMessageSingleViewPage;
