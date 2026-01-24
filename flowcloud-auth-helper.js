/**
 * FlowCloud Auth Helper
 * 
 * Bu modül, FlowCloud ile güvenli iletişim kurmak isteyen diğer sunucular için
 * gerekli olan doğrulama endpoint'ini otomatik olarak kurar.
 * 
 * Kullanım:
 * 1. Projenizin .env dosyasına SYSTEM_ACCESS_KEY ekleyin.
 * 2. Bu dosyayı projenize dahil edin.
 * 3. Express uygulamanıza şu şekilde entegre edin:
 * 
 *    const { setupFlowCloud } = require('./flowcloud-auth-helper');
 *    const app = express();
 *    setupFlowCloud(app);
 */

function setupFlowCloud(app, options = {}) {
    const key = options.key || process.env.SYSTEM_ACCESS_KEY;
    const path = options.path || '/flowcloud-auth';

    if (!key) {
        console.warn('\x1b[33m%s\x1b[0m', '⚠️ FlowCloud Warning: SYSTEM_ACCESS_KEY bulunamadı. Auth endpoint aktif değil.');
        return;
    }

    // Endpoint'i kur
    app.get(path, (req, res) => {
        // Sadece plain text olarak anahtarı döndür
        res.send(key);
    });

    console.log('\x1b[32m%s\x1b[0m', `✅ FlowCloud: Auth endpoint "${path}" başarıyla kuruldu.`);
    console.log('   Artık FlowCloud sunucusu bu sunucuyu doğrulayabilir.');
}

/**
 * FlowCloud'dan dosya çekmek için yardımcı fonksiyon
 * @param {string} flowCloudUrl - FlowCloud sunucu adresi (örn: https://flowcloud.onrender.com)
 * @param {string} filename - İstenen dosya adı
 * @returns {Promise<string>} - Dosya içeriği
 */
async function fetchFromFlowCloud(flowCloudUrl, filename) {
    const targetUrl = `${flowCloudUrl}/api/proxy/files/${filename}`;

    // Header ekle
    const headers = {
        'X-App-Request': '1'
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
    setupFlowCloud,
    fetchFromFlowCloud
};
