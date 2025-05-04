import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { disconnectProvider } from '@/lib/oauth'; // hypothetical helper function for disconnecting providers

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { provider } = req.query;

  if (!provider || typeof provider !== 'string') {
    return res.status(400).json({ message: 'Invalid provider' });
  }

  try {
    const userId = session.user.id;

    // Ensure at least one connected account remains
    const connectedAccounts = await getConnectedAccounts(userId); // hypothetical function to fetch connected accounts
    if (connectedAccounts.length <= 1) {
      return res.status(400).json({ message: 'At least one account must remain connected' });
    }

    // Disconnect the provider
    await disconnectProvider(userId, provider);

    res.status(200).json({ message: 'Provider disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting provider:', error);
    res.status(500).json({ message: 'Failed to disconnect provider' });
  }
}

async function getConnectedAccounts(userId: string): Promise<{ provider: string }[]> {
  // Hypothetical function to fetch connected accounts from the database
  // Replace this with actual database logic
  return [
    { provider: 'github' },
    { provider: 'google' },
  ];
}