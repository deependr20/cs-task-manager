/**
 * One-time migration for production DB after deploying the new schema.
 * Run this ONCE against your production MongoDB (e.g. Atlas) after you deploy.
 *
 * Usage (from project root):
 *   node scripts/migrate-production.js
 *   (Loads MONGODB_URI from .env or .env.local)
 *   Or pass it: node scripts/migrate-production.js "mongodb+srv://..."
 *
 * If you get querySrv ECONNREFUSED, this script resolves SRV via DNS-over-HTTPS
 * and connects with a direct URI to bypass broken local DNS.
 *
 * What it does:
 * 1. Tasks: "Pending Approval" -> "Pending Admin Approval" (so old tasks match new enum)
 * 2. Users: set missing/empty "designation" to "Staff" so they pass validation
 */

require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

// Connection string: CLI arg, or from .env / .env.local
let MONGODB_URI = process.argv[2]?.trim() || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set. Add it to .env or .env.local, or pass it:');
  console.error('   node scripts/migrate-production.js "mongodb+srv://user:pass@host/dbname"');
  process.exit(1);
}

/**
 * Resolve MongoDB SRV via DNS-over-HTTPS (bypasses broken local DNS) and return direct URI.
 * @param {string} srvUri - mongodb+srv://user:pass@host/dbname?options
 * @returns {Promise<string>} - mongodb://user:pass@host1:port,host2:port,.../dbname?options
 */
async function resolveSrvToDirectUri(srvUri) {
  const match = srvUri.match(/^mongodb\+srv:\/\/([^:@]+):([^@]+)@([^/]+)\/([^?]*)(\?.*)?$/);
  if (!match) {
    throw new Error('Invalid mongodb+srv URI format');
  }
  const [, user, password, srvHost, dbName, query = ''] = match;
  const srvName = `_mongodb._tcp.${srvHost}`;
  const dohUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(srvName)}&type=SRV`;
  const res = await fetch(dohUrl, { headers: { Accept: 'application/dns-json' } });
  const json = await res.json();
  if (!json.Answer || json.Answer.length === 0) {
    throw new Error('No SRV records found for ' + srvName);
  }
  const hosts = [];
  for (const ans of json.Answer) {
    if (ans.type !== 33 && ans.type !== 'SRV') continue; // DNS SRV = type 33
    const data = (ans.data || '').trim();
    const parts = data.split(/\s+/);
    const port = parts[2] || '27017';
    const target = (parts[3] || '').replace(/\.$/, '');
    if (target) hosts.push(`${target}:${port}`);
  }
  if (hosts.length === 0) throw new Error('Could not parse SRV records (no type 33 answers)');
  const auth = encodeURIComponent(user) + ':' + encodeURIComponent(password);
  const opts = query ? query.replace(/^\?/, '') : '';
  const extra = opts ? (opts.includes('ssl') ? opts : `ssl=true&${opts}`) : 'ssl=true';
  if (!extra.includes('authSource=')) {
    return `mongodb://${auth}@${hosts.join(',')}/${dbName}?${extra}&authSource=admin`;
  }
  return `mongodb://${auth}@${hosts.join(',')}/${dbName}?${extra}`;
}

async function migrate() {
  try {
    let uri = MONGODB_URI;
    if (uri.startsWith('mongodb+srv://')) {
      try {
        console.log('Resolving Atlas hostnames via DNS-over-HTTPS (bypassing local DNS)...');
        uri = await resolveSrvToDirectUri(uri);
        console.log('Using direct connection string.\n');
      } catch (e) {
        console.error('SRV resolve failed:', e.message);
        console.log('Falling back to original URI...\n');
      }
    }
    await mongoose.connect(uri);
    console.log('Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // 1. Migrate tasks: old status "Pending Approval" -> "Pending Admin Approval"
    const tasksCollection = db.collection('tasks');
    const taskResult = await tasksCollection.updateMany(
      { status: 'Pending Approval' },
      { $set: { status: 'Pending Admin Approval' } }
    );
    if (taskResult.modifiedCount > 0) {
      console.log(`✅ Tasks: updated ${taskResult.modifiedCount} task(s) from "Pending Approval" to "Pending Admin Approval"`);
    } else {
      console.log('✅ Tasks: no tasks with old status "Pending Approval" (nothing to update)');
    }

    // 2. Migrate users: set missing or empty designation so validation passes
    const usersCollection = db.collection('users');
    const userResult = await usersCollection.updateMany(
      { $or: [{ designation: { $exists: false } }, { designation: '' }] },
      { $set: { designation: 'Staff' } }
    );
    if (userResult.modifiedCount > 0) {
      console.log(`✅ Users: set "designation" to "Staff" for ${userResult.modifiedCount} user(s) that had it missing or empty`);
    } else {
      console.log('✅ Users: all users already have a designation (nothing to update)');
    }

    console.log('\n✅ Migration completed. Safe to use the app against this DB.');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrate();
