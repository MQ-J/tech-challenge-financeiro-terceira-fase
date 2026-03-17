import bcrypt from "react-native-bcrypt";

function isBcryptHash(str: string): boolean {
  return /^\$2[ayb]\$.{56}$/.test(str)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSaltSync(10)
  return bcrypt.hashSync(password, salt)
}

export async function comparePassword(
  inputPassword: string,
  storedPassword: string,
): Promise<{ matches: boolean; needsMigration: boolean }> {
  if (isBcryptHash(storedPassword)) {
    const matches = await bcrypt.compareSync(inputPassword, storedPassword)
    return { matches, needsMigration: false }
  }

  const matches = inputPassword === storedPassword
  return { matches, needsMigration: matches }
}

export async function migratePassword(oldPassword: string): Promise<string> {
  return hashPassword(oldPassword)
}

