import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { sequelize, User, EventType, AISetting } from './models/index.js';
import { encrypt } from './utils/crypto.js';

const PORT = process.env.PORT || 5000;

async function autoSeed() {
  try {
    const userCount = await User.count();
    if (userCount > 0) {
      console.log(`Users already exist (${userCount}), skipping seed.`);
      return;
    }

    console.log('No users found, seeding default data...');

    // Users
    const users = [
      { name: 'Super Admin', email: 'admin@daniswara.com', password_hash: 'password123', role: 'super_admin', division: 'IT', position: 'Administrator' },
      { name: 'Admin Event', email: 'event@daniswara.com', password_hash: 'password123', role: 'admin_event', division: 'General Affairs', position: 'Event Coordinator' },
      { name: 'PIC Event', email: 'pic@daniswara.com', password_hash: 'password123', role: 'pic_event', division: 'General Affairs', position: 'Staff' },
      { name: 'Direksi', email: 'direksi@daniswara.com', password_hash: 'password123', role: 'viewer', division: 'Direksi', position: 'Direktur' },
    ];

    for (const u of users) {
      await User.create(u);
      console.log(`  User created: ${u.email}`);
    }

    // Event Types
    const eventTypes = [
      { name: 'Ulang Tahun Perusahaan', slug: 'hut-perusahaan', description: 'Hari Ulang Tahun Perusahaan', icon: 'cake', color: '#EF4444' },
      { name: 'Management Review Quartalan', slug: 'management-review', description: 'Rapat tinjauan manajemen quarterly', icon: 'assessment', color: '#3B82F6' },
      { name: 'Rapat Tahunan', slug: 'rapat-tahunan', description: 'Rapat tahunan perusahaan', icon: 'groups', color: '#6366F1' },
      { name: 'Gathering Karyawan', slug: 'gathering-karyawan', description: 'Acara gathering dan team building', icon: 'celebration', color: '#22C55E' },
      { name: 'Training Internal', slug: 'training-internal', description: 'Pelatihan dan workshop internal', icon: 'school', color: '#EAB308' },
      { name: 'Town Hall Meeting', slug: 'town-hall', description: 'Town Hall Meeting', icon: 'record_voice_over', color: '#A855F7' },
      { name: 'Santunan / CSR', slug: 'santunan-csr', description: 'Acara santunan dan CSR', icon: 'volunteer_activism', color: '#EC4899' },
      { name: 'Acara Perpisahan', slug: 'acara-perpisahan', description: 'Acara perpisahan pegawai', icon: 'waving_hand', color: '#F97316' },
      { name: 'Launching Program', slug: 'launching-program', description: 'Peluncuran program baru', icon: 'rocket_launch', color: '#06B6D4' },
      { name: 'Event Khusus Lainnya', slug: 'event-lainnya', description: 'Event khusus lainnya', icon: 'star', color: '#6B7280' },
    ];

    for (const et of eventTypes) {
      await EventType.findOrCreate({ where: { slug: et.slug }, defaults: et });
    }
    console.log('  Event types seeded.');

    // AI Settings
    await AISetting.findOrCreate({
      where: { provider_name: 'openai' },
      defaults: {
        provider_name: 'openai',
        base_url: 'https://api.openai.com/v1',
        model: 'gpt-4o',
        default_system_prompt: 'Kamu adalah AI Event Planner profesional untuk PT Daniswara Group.',
        temperature: 0.7,
        max_tokens: 8000,
        is_active: true,
      },
    });
    console.log('  AI Settings seeded.');

    console.log('Auto-seed completed.');
  } catch (error) {
    console.error('Auto-seed failed:', error.message);
    // Don't crash — app can still run without seed data
  }
}

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    await sequelize.sync();
    console.log('Models synced.');

    await autoSeed();

    app.listen(PORT, () => {
      console.log(`Daniswara Event Planner API running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
