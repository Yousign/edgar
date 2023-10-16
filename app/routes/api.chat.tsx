import type { ActionFunctionArgs } from '@remix-run/node';
import { chat } from '~/api/chat';

export const config = { runtime: 'edge' };

const initialDate = Date.now();

export function headers() {
  return {
    'x-edge-age': Date.now() - initialDate,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const values = await request.json();

  return chat(values['messages']);
}
