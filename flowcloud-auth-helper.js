const crypto = require('crypto');

/**
 * FlowCloud Auth Helper
 * 
 * Bu modül, FlowCloud ile güvenli iletişim kurmak isteyen diğer sunucular için
 * gerekli olan imzalama işlemlerini otomatik yapar.
 * 
 * Kullanım:
 * 1. Projenizin .env dosyasına SYSTEM_ACCESS_KEY ekleyin.
 * 2. Bu dosyayı projenize dahil edin.
 * 3. fetchFromFlowCloud fonksiyonunu kullanarak dosya çekin.
 */

/**
 * FlowCloud'dan dosya çekmek için yardımcı fonksiyon
 * @param {string} flowCloudUrl - FlowCloud sunucu adresi (örn: https://flowcloud.onrender.com)
 * @param {string} filename - İstenen dosya adı
 * @param {string} myOrigin - Kendi sunucu adresiniz (örn: https://mysite.com). Bu adres FlowCloud'da allowed.json içinde olmalıdır.
 * @returns {Promise<string>} - Dosya içeriği
 */
async function fetchFromFlowCloud(flowCloudUrl, filename, myOrigin) {
    const targetUrl = `${flowCloudUrl}/api/proxy/files/${filename}`;
    const key = process.env.SYSTEM_ACCESS_KEY;

    if (!key) {
        throw new Error('FlowCloud Error: SYSTEM_ACCESS_KEY bulunamadı. .env dosyanızı kontrol edin.');
    }

    if (!myOrigin) {
        throw new Error('FlowCloud Error: "myOrigin" parametresi zorunludur. Kendi sunucu adresinizi belirtmelisiniz.');
    }

    // İmza Oluşturma
    const timestamp = Date.now().toString();
    const payload = `${timestamp}:${filename}`;
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(payload);
    const signature = hmac.digest('hex');

    // Header ekle
    const headers = {
        'X-App-Request': '1',
        'Origin': myOrigin,
        'x-flowcloud-date': timestamp,
        'x-flowcloud-signature': signature
    };

    try {
        const response = await fetch(targetUrl, { headers });

        if (!response.ok) {
            throw new Error(`FlowCloud Error: ${response.status} ${response.statusText}`);
        }

        return await response.text();
    } catch (error) {
        console.error('❌ FlowCloud Fetch Error:', error.message);
        throw error;
    }
}

module.exports = {
    fetchFromFlowCloud
};
