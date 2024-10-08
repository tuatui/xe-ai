export const derivePwd = async (name: string, pwd: string): Promise<string> =>
  pbkdf2Crypto(pwd, 1e6, name);

const SALT_LEN = 16;
const SALT_ITER = 1e5;
export const derivePwdFast = async (pwd: string): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const res = await pbkdf2Crypto(pwd, SALT_ITER, salt);
  return u8a2String(salt) + res;
};

export const checkDerivePwdFast = async (
  pwd: string,
  sk: string,
): Promise<boolean> => {
  const salt = string2U8a(sk.slice(0, SALT_LEN));
  const derivePwd = sk.slice(SALT_LEN);
  const res = await pbkdf2Crypto(pwd, SALT_ITER, salt);
  return derivePwd === res;
};

const pbkdf2Crypto = async (
  pwd: string,
  iterations: number,
  useSalt?: Uint8Array | string,
): Promise<string> => {
  if (!crypto?.subtle) throw new Error("you should use https or localhost");

  const password = new TextEncoder().encode(pwd);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    password,
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const salt =
    typeof useSalt !== "string"
      ? useSalt
      : new Uint8Array(
          await crypto.subtle.deriveBits(
            {
              name: "PBKDF2",
              hash: "SHA-512",
              salt: new TextEncoder().encode(useSalt),
              iterations: 1024,
            },
            baseKey,
            512,
          ),
        );

  const buf = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-512",
      salt,
      iterations,
    },
    baseKey,
    512,
  );

  return u8a2String(new Uint8Array(buf));
};

export const gcmCryptoEncrypt = async (
  key: string,
  data: string,
): Promise<{
  data: string;
  iv: string;
  key: string;
}> => {
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
      ["deriveBits"],
    ),
    256,
  );

  const baseKey = await crypto.subtle.importKey("raw", uKey, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv } satisfies AesGcmParams,
    baseKey,
    uData,
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
}): Promise<string> => {
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
      ["deriveBits"],
    ),
    256,
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
    uData,
  );

  return new TextDecoder().decode(decrypted);
};
export const u8a2String = (i: Uint8Array) => String.fromCharCode(...i);
export const string2U8a = (i: string): Uint8Array => {
  const u = new Uint8Array(i.length);
  for (let index = 0; index < i.length; index++) u[index] = i.charCodeAt(index);
  return u;
};
