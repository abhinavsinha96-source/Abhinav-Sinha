import { GroundedPlace, GeminiModelId } from '../types';

export interface ChatApiMessage {
  role: 'user' | 'model';
  text: string;
}

export async function sendChatMessage(
  messages: ChatApiMessage[],
  systemInstruction: string,
  model: GeminiModelId = 'gemini-3.5-flash'
): Promise<string> {
  const res = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemInstruction, model }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || 'Failed to communicate with Haven AI');
  }

  const data = await res.json();
  return data.reply;
}

export async function queryMapsGrounding(
  query: string,
  coords?: { latitude: number; longitude: number }
): Promise<{ text: string; places: GroundedPlace[] }> {
  const res = await fetch('/api/gemini/maps-grounding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || 'Maps grounding query failed');
  }

  const data = await res.json();
  return {
    text: data.text || '',
    places: data.places || [],
  };
}

export async function generateStoryImage(
  prompt: string,
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' = '1:1'
): Promise<string> {
  const res = await fetch('/api/gemini/image-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspectRatio }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || 'Image creation failed');
  }

  const data = await res.json();
  return data.imageUrl;
}

export async function editStoryImage(
  prompt: string,
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  const res = await fetch('/api/gemini/image-edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, imageBase64, mimeType }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || 'Image editing failed');
  }

  const data = await res.json();
  return data.imageUrl;
}

export async function startVeoVideoGeneration(
  imageBase64: string,
  prompt: string,
  aspectRatio: '16:9' | '9:16' = '16:9',
  mimeType: string = 'image/jpeg'
): Promise<string> {
  const res = await fetch('/api/veo/generate-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, prompt, aspectRatio, mimeType }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || 'Video animation request failed');
  }

  const data = await res.json();
  return data.operationName;
}

export async function checkVeoVideoStatus(
  operationName: string
): Promise<{ done: boolean; error?: any; hasVideo?: boolean }> {
  const res = await fetch('/api/veo/video-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || 'Status check failed');
  }

  return await res.json();
}

export async function downloadVeoVideoBlob(operationName: string): Promise<string> {
  const res = await fetch('/api/veo/video-download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || 'Video download failed');
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
