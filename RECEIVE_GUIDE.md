# FlowCloud Secure File Access Guide (Secondary Servers)

Bu rehber, yetkili ikincil sunucuların (Secondary Servers) FlowCloud ana sunucusundan nasıl güvenli bir şekilde dosya çekebileceğini anlatır.

## Ön Gereksinimler

1.  **SYSTEM_ACCESS_KEY:** Ana sunucu ile aynı anahtara sahip olmalısınız. Bu anahtarı `.env` dosyanıza ekleyin.
2.  **Allowed Host:** Sunucunuzun adresi (Origin), ana sunucudaki `allowed.json` listesinde ekli olmalıdır.

## Kurulum

1.  `flowcloud-auth-helper.js` dosyasını projenize indirin/kopyalayın.
2.  Projenizde `express` ve `node-fetch` (Node 18+ ise yerleşik fetch kullanılır) olduğundan emin olun.

## Kullanım

### 1. Kimlik Doğrulama Kurulumu (Setup)

Sunucunuz başladığında, FlowCloud'un sizi doğrulayabilmesi için gerekli endpoint'i kurmalısınız.

```javascript
const express = require('express');
const { setupFlowCloud } = require('./flowcloud-auth-helper');

const app = express();

// Otomatik Origin Algılama (RENDER_EXTERNAL_URL veya BASE_URL varsa)
setupFlowCloud(app);

// VEYA Manuel Origin Belirtme (Önerilen)
// setupFlowCloud(app, { origin: 'https://mysite.com' });

app.listen(3000);
```

### 2. Dosya Çekme (Fetch)

Dosyaları okumak için `fetchFromFlowCloud` fonksiyonunu kullanın.

```javascript
const { fetchFromFlowCloud } = require('./flowcloud-auth-helper');

async function dosyaOku() {
  try {
    // Parametreler: (FlowCloud Adresi, Dosya Adı)
    // Origin, setupFlowCloud'da ayarlandığı için burada tekrar vermeye gerek yok.
    const icerik = await fetchFromFlowCloud('https://flowcloud.onrender.com', 'flowscript.txt');
    
    console.log("Dosya İçeriği:", icerik);
    
    // İsterseniz JSON parse edebilirsiniz (eğer dosya json ise)
    // const data = JSON.parse(icerik);
    
  } catch (error) {
    console.error("Hata oluştu:", error.message);
    // Hata durumları:
    // 404: Dosya yok veya SYSTEM_ACCESS_KEY yanlış
    // 403: Origin listede yok veya HMAC doğrulaması başarısız
  }
}
```

## Güvenlik Mantığı (Nasıl Çalışır?)

1.  Siz dosya istersiniz.
2.  FlowCloud sunucusu, sizin sunucunuza geri döner (`GET /flowcloud-auth`) ve bir **Challenge** (rastgele sayı) gönderir.
3.  Sizin sunucunuz (Helper sayesinde), bu sayıyı `SYSTEM_ACCESS_KEY` ile şifreleyip (HMAC) geri gönderir.
4.  FlowCloud imzayı doğrular ve Origin'inizin izinli listede olup olmadığına bakar.
5.  Her şey tamamsa dosya gönderilir.

**Not:** `SYSTEM_ACCESS_KEY` asla ağ üzerinden gönderilmez. Sadece imzalama işlemi için kullanılır.
