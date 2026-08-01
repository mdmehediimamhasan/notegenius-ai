/**
 * Admin seed script — creates or upserts the NoteGenius admin account.
 * Run with: node scripts/create-admin.mjs
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const ADMIN_EMAIL = 'admin@notegenius.ai'
const ADMIN_PASSWORD = 'NoteGenius@Admin2026!'
const ADMIN_NAME = 'NoteGenius Admin'

async function main() {
  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12)

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      hashedPassword: hashed,
      isAdmin: true,
      name: ADMIN_NAME,
    },
    create: {
      email: ADMIN_EMAIL,
      hashedPassword: hashed,
      isAdmin: true,
      name: ADMIN_NAME,
    },
  })

  console.log('\n✅  Admin account ready!')
  console.log('──────────────────────────────')
  console.log('  Email   :', ADMIN_EMAIL)
  console.log('  Password:', ADMIN_PASSWORD)
  console.log('  ID      :', admin.id)
  console.log('──────────────────────────────\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
