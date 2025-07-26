import crypto from "node:crypto";

export function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) {
        reject(err);
      }
      resolve(derivedKey.toString("hex").normalize());
    });
  });
}
export async function comparePasswords(
  hashedPassword: string,
  password: string,
  salt: string,
) {
  const inputHashedPassword = await hashPassword(password, salt);

  return crypto.timingSafeEqual(
    Buffer.from(hashedPassword, "hex"),
    Buffer.from(inputHashedPassword, "hex"),
  );
}

export function generateSalt() {
  return crypto.randomBytes(16).toString("hex").normalize();
}
