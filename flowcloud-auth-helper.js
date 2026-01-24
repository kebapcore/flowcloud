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
