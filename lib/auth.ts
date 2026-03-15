import bcrypt from 'bcryptjs'

function isBcryptHash(str: string): boolean {
  return /^\$2[ayb]\$.{56}$/.test(str)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(
  inputPassword: string,
  storedPassword: string,
): Promise<{ matches: boolean; needsMigration: boolean }> {
  if (isBcryptHash(storedPassword)) {
    const matches = await bcrypt.compare(inputPassword, storedPassword)
    return { matches, needsMigration: false }
  }

  const matches = inputPassword === storedPassword
  return { matches, needsMigration: matches }
}

export async function migratePassword(oldPassword: string): Promise<string> {
  return hashPassword(oldPassword)
}

