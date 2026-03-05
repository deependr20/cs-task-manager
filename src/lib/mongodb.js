import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Resolve mongodb+srv via DNS-over-HTTPS so local dev works when system DNS blocks Atlas SRV.
 */
async function resolveSrvToDirectUri(srvUri) {
  const match = srvUri.match(/^mongodb\+srv:\/\/([^:@]+):([^@]+)@([^/]+)\/([^?]*)(\?.*)?$/);
  if (!match) throw new Error('Invalid mongodb+srv URI format');
  const [, user, password, srvHost, dbName, query = ''] = match;
  const srvName = `_mongodb._tcp.${srvHost}`;
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(srvName)}&type=SRV`,
    { headers: { Accept: 'application/dns-json' } }
  );
  const json = await res.json();
  if (!json.Answer?.length) throw new Error('No SRV records found');
  const hosts = [];
  for (const ans of json.Answer) {
    if (ans.type !== 33 && ans.type !== 'SRV') continue;
    const parts = (ans.data || '').trim().split(/\s+/);
    const port = parts[2] || '27017';
    const target = (parts[3] || '').replace(/\.$/, '');
    if (target) hosts.push(`${target}:${port}`);
  }
  if (!hosts.length) throw new Error('Could not parse SRV records');
  const auth = encodeURIComponent(user) + ':' + encodeURIComponent(password);
  const opts = query ? query.replace(/^\?/, '') : '';
  const extra = opts ? (opts.includes('ssl') ? opts : `ssl=true&${opts}`) : 'ssl=true';
  const authSource = extra.includes('authSource=') ? '' : '&authSource=admin';
  return `mongodb://${auth}@${hosts.join(',')}/${dbName}?${extra}${authSource}`;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    let uri = MONGODB_URI;
    if (uri.startsWith('mongodb+srv://')) {
      try {
        uri = await resolveSrvToDirectUri(uri);
      } catch (e) {
        console.warn('MongoDB SRV resolve failed, using original URI:', e.message);
      }
    }
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(uri, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
