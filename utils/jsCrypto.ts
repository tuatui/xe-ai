export const pbkdf2Crypto = async (name: string, pwd: string) => {
  if (!crypto?.subtle) throw new Error("you should use https or localhost");

  const username = new TextEncoder().encode(name);
  const password = new TextEncoder().encode(pwd);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    password,
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const salt = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-512",
      salt: username,
      iterations: 1024,
    },
    baseKey,
    512
  );
  const buf = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: new Uint8Array(salt),
      iterations: 1e6,
    },
    baseKey,
    256
  );

  return u8a2String(new Uint8Array(buf));
};
export const gcmCryptoEncrypt = async (key: string, data: string) => {
  const uData = new TextEncoder().encode(data);

  const uKey = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-512",
      salt: new TextEncoder().encode(key),
      iterations: 1024,
    },
    await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(key),
      "PBKDF2",
      false,
      ["deriveBits"]
    ),
    256
  );

  const baseKey = await crypto.subtle.importKey("raw", uKey, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv } satisfies AesGcmParams,
    baseKey,
    uData
  );

  return {
    data: u8a2String(new Uint8Array(encrypted)),
    iv: u8a2String(iv),
    key,
  };
};

export const gcmCryptoDecrypt = async ({
  key,
  data,
  iv,
}: {
  key: string;
  data: string;
  iv: string;
}) => {
  const uKey = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-512",
      salt: new TextEncoder().encode(key),
      iterations: 1024,
    },
    await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(key),
      "PBKDF2",
      false,
      ["deriveBits"]
    ),
    256
  );
  const baseKey = await crypto.subtle.importKey("raw", uKey, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);

  const uData = string2U8a(data);
  const uIv = string2U8a(iv);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: uIv } satisfies AesGcmParams,
    baseKey,
    uData
  );

  return new TextDecoder().decode(decrypted);
};
export const u8a2String = (i: Uint8Array) => String.fromCharCode(...i);
export const string2U8a = (i: string) => {
  const u = new Uint8Array(i.length);
  for (let index = 0; index < i.length; index++) u[index] = i.charCodeAt(index);
  return u;
};
