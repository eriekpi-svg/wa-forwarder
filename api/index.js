// Konfigurasi Anda (JANGAN DIUBAH)
const WA_VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN;
const TARGET_URL = "https://bintangcartravel.com/crm/data_receiver.php"; // URL Hostinger Anda

// Fungsi utama yang dipanggil Vercel
export default async function handler(request) {
  const url = new URL(request.url);
  
  // --- 1. LOGIKA GET (VERIFIKASI META) ---
  if (request.method === 'GET') {
    const mode = url.searchParams.get('hub_mode');
    const token = url.searchParams.get('hub_verify_token');
    const challenge = url.searchParams.get('hub_challenge');

    if (mode === 'subscribe' && token === WA_VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    } else {
      return new Response("Verification failed.", { status: 403 });
    }
  }

  // --- 2. LOGIKA POST (FORWARD KE HOSTINGER) ---
  if (request.method === 'POST') {
    try {
      // Menerima request body
      const body = await request.text(); 
      
      // Meneruskan request ke Hostinger (yang kini akan dianggap request internal/bersih)
      await fetch(TARGET_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': request.headers.get('x-real-ip') || 'vercel-proxy',
        },
        body: body,
      });

      // Harus mengembalikan 200 OK ke Meta secepat mungkin
      return new Response('OK', { status: 200 });

    } catch (error) {
      // Jika Hostinger gagal/lama merespons, tetap kirim 200 OK ke Meta
      return new Response('OK', { status: 200 });
    }
  }

  return new Response("Method Not Allowed", { status: 405 });
}
