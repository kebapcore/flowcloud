const crypto = require('crypto');

// Modül seviyesinde origin'i saklamak için
let _configuredOrigin = null;

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
 *    setupFlowCloud(app, { origin: 'https://mysite.com' });
 */

function setupFlowCloud(app, options = {}) {
    const key = options.key || process.env.SYSTEM_ACCESS_KEY;
    const path = options.path || '/flowcloud-auth';

    // Origin'i belirle: Options > Env (RENDER_EXTERNAL_URL) > Env (BASE_URL)
    _configuredOrigin = options.origin || process.env.RENDER_EXTERNAL_URL || process.env.BASE_URL;

    if (!key) {
        console.warn('\x1b[33m%s\x1b[0m', '⚠️ FlowCloud Warning: SYSTEM_ACCESS_KEY bulunamadı. Auth endpoint aktif değil.');
        return;
    }

    if (!_configuredOrigin) {
        console.warn('\x1b[33m%s\x1b[0m', '⚠️ FlowCloud Warning: Origin belirlenemedi. fetchFromFlowCloud kullanırken manuel belirtmeniz gerekebilir.');
    }

    // Endpoint'i kur
    app.get(path, (req, res) => {
        // Challenge artık Header'dan okunuyor (Query param yerine)
        const challenge = req.headers['x-flowcloud-challenge'];

        if (!challenge) {
            return res.status(400).send('Challenge Required');
        }

        // HMAC SHA256 ile imzala
        const hmac = crypto.createHmac('sha256', key);
        hmac.update(challenge);
        const signature = hmac.digest('hex');

        res.send(signature);
    });

    console.log('\x1b[32m%s\x1b[0m', `✅ FlowCloud: Auth endpoint "${path}" başarıyla kuruldu.`);
    if (_configuredOrigin) {
        console.log('   Origin:', _configuredOrigin);
    }
}

/**
 * FlowCloud'dan dosya çekmek için yardımcı fonksiyon
 * @param {string} flowCloudUrl - FlowCloud sunucu adresi (örn: https://flowcloud.onrender.com)
 * @param {string} filename - İstenen dosya adı
 * @param {string} [manualOrigin] - Opsiyonel. setupFlowCloud ile ayarlanmadıysa buradan verilebilir.
 * @returns {Promise<string>} - Dosya içeriği
 */
async function fetchFromFlowCloud(flowCloudUrl, filename, manualOrigin) {
    const targetUrl = `${flowCloudUrl}/api/proxy/files/${filename}`;
    const myOrigin = manualOrigin || _configuredOrigin;

    if (!myOrigin) {
        throw new Error('FlowCloud Error: Origin belirlenemedi. setupFlowCloud içinde { origin: "..." } belirtin veya environment variable (RENDER_EXTERNAL_URL) kullanın.');
    }

    // Header ekle
    const headers = {
        'X-App-Request': '1',
        'Origin': myOrigin
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
