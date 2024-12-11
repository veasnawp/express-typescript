import mime from "mime";
import fetch from "node-fetch";
import type { RequestInit } from 'node-fetch';


export async function imageToBase64(url: string) {
  let ext = 'png';
  let img64: Buffer;
  const r = await fetch(url);
  const type = r.headers.get('content-type');
  const contentDisposition = r.headers.get('content-disposition');
  if (contentDisposition) {
    ext = contentDisposition.split('.').at(-1)?.replace(/["']/g, "") as string
  }
  else if (type) {
    ext = mime.getExtension(type) || ext
  }
  const arrayBuffer = await r.arrayBuffer();
  img64 = Buffer.from(arrayBuffer);

  let imageBase64 = `data:image/${ext};base64,`;
  imageBase64 = imageBase64 + img64.toString('base64');

  return imageBase64;
};

export async function getIpAddress(lang = 'en', options?: RequestInit) {
  const api = lang
    ? `https://whoer.net/${lang || 'en'}/main/api/ip`
    : 'https://api.ipify.org/?format=json';

  const r = await fetch(api, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = (await r.json()) as any;
  if (lang) {
    return data.data;
  }
  return data;
};