import { sequelize, User, EventType, AISetting } from '../models/index.js';

async function seed() {
  try {
    console.log('Starting database seed...');
    await sequelize.authenticate();
    console.log('Database connected.');

    // ── Users ──────────────────────────────────────────
    // Password is hashed by User model beforeCreate hook
    const users = [
      { name: 'Super Admin', email: 'admin@daniswara.com', password_hash: 'password123', role: 'super_admin', division: 'IT', position: 'Administrator' },
      { name: 'Admin Event', email: 'event@daniswara.com', password_hash: 'password123', role: 'admin_event', division: 'General Affairs', position: 'Event Coordinator' },
      { name: 'PIC Event', email: 'pic@daniswara.com', password_hash: 'password123', role: 'pic_event', division: 'General Affairs', position: 'Staff' },
      { name: 'Direksi', email: 'direksi@daniswara.com', password_hash: 'password123', role: 'viewer', division: 'Direksi', position: 'Direktur' },
    ];

    for (const u of users) {
      await User.findOrCreate({ where: { email: u.email }, defaults: u });
      console.log(`  User seeded: ${u.email}`);
    }

    // ── Event Types ────────────────────────────────────
    const eventTypes = [
      { name: 'Ulang Tahun Perusahaan', slug: 'hut-perusahaan', description: 'Hari Ulang Tahun Perusahaan (HUT)', icon: 'cake', color: '#EF4444' },
      { name: 'Management Review Quartalan', slug: 'management-review', description: 'Rapat tinjauan manajemen quarterly', icon: 'assessment', color: '#3B82F6' },
      { name: 'Rapat Tahunan', slug: 'rapat-tahunan', description: 'Rapat tahunan perusahaan / RUPS', icon: 'groups', color: '#6366F1' },
      { name: 'Gathering Karyawan', slug: 'gathering-karyawan', description: 'Acara gathering dan team building', icon: 'celebration', color: '#22C55E' },
      { name: 'Training Internal', slug: 'training-internal', description: 'Pelatihan dan workshop internal', icon: 'school', color: '#EAB308' },
      { name: 'Town Hall Meeting', slug: 'town-hall', description: 'Town Hall Meeting dengan seluruh karyawan', icon: 'record_voice_over', color: '#A855F7' },
      { name: 'Santunan / CSR', slug: 'santunan-csr', description: 'Acara santunan dan program CSR', icon: 'volunteer_activism', color: '#EC4899' },
      { name: 'Acara Perpisahan', slug: 'acara-perpisahan', description: 'Acara perpisahan pegawai yang pensiun/pindah', icon: 'waving_hand', color: '#F97316' },
      { name: 'Launching Program', slug: 'launching-program', description: 'Peluncuran program atau produk baru', icon: 'rocket_launch', color: '#06B6D4' },
      { name: 'Event Khusus Lainnya', slug: 'event-lainnya', description: 'Event khusus lainnya yang tidak termasuk kategori di atas', icon: 'star', color: '#6B7280' },
    ];

    for (const et of eventTypes) {
      await EventType.findOrCreate({ where: { slug: et.slug }, defaults: et });
      console.log(`  EventType seeded: ${et.name}`);
    }

    // ── AI Settings ────────────────────────────────────
    const defaultSystemPrompt = `Kamu adalah AI Event Planner profesional untuk PT Daniswara. Tugas kamu adalah membantu perencanaan, eksekusi, dan evaluasi event korporasi.

Kemampuan kamu meliputi:
1. Merancang konsep dan tema event
2. Membuat timeline dan rundown acara
3. Menghitung dan mengoptimasi budget
4. Mengidentifikasi risiko dan membuat rencana mitigasi
5. Membuat dokumen event (undangan, TOR, proposal, dll)
6. Mengevaluasi hasil event dan memberikan rekomendasi

Selalu berikan respons dalam Bahasa Indonesia yang profesional. Format output dalam JSON sesuai dengan struktur yang diminta.`;

    await AISetting.findOrCreate({
      where: { provider_name: 'openai' },
      defaults: {
        provider_name: 'openai',
        base_url: 'https://api.openai.com/v1',
        model: 'gpt-4o',
        default_system_prompt: defaultSystemPrompt,
        temperature: 0.7,
        max_tokens: 8000,
        is_active: true,
      },
    });
    console.log('  AI Settings seeded.');

    console.log('Seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
