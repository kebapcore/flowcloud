# FlowCloud Secure File Access Guide (Secondary Servers)

Bu rehber, yetkili ikincil sunucuların (Secondary Servers) FlowCloud ana sunucusundan nasıl güvenli bir şekilde dosya çekebileceğini anlatır.

## Ön Gereksinimler

1.  **SYSTEM_ACCESS_KEY:** Ana sunucu ile aynı anahtara sahip olmalısınız. Bu anahtarı `.env` dosyanıza ekleyin.
2.  **Allowed Host:** Sunucunuzun adresi (Origin), ana sunucudaki `allowed.json` listesinde ekli olmalıdır.

## Kurulum

1.  `flowcloud-auth-helper.js` dosyasını projenize indirin/kopyalayın.
2.  Projenizde `express` ve `node-fetch` (Node 18+ ise yerleşik fetch kullanılır) olduğundan emin olun.

## Kullanım

### Dosya Çekme (Fetch)

Artık herhangi bir sunucu kurulumu (`setupFlowCloud`) yapmanıza gerek yoktur. Sadece `fetchFromFlowCloud` fonksiyonunu kullanarak dosyaları güvenle çekebilirsiniz.

```javascript
const { fetchFromFlowCloud } = require('./flowcloud-auth-helper');

async function dosyaOku() {
  try {
    // Parametreler: (FlowCloud Adresi, Dosya Adı, Sizin Adresiniz)
    const icerik = await fetchFromFlowCloud(
      'https://flowcloud.onrender.com', 
      'flowscript.txt',
      'https://mysite.com' // Origin (allowed.json'da olmalı)
    );
    
    console.log("Dosya İçeriği:", icerik);
    
  } catch (error) {
    console.error("Hata oluştu:", error.message);
    // Hata durumları:
    // 404: Dosya yok veya SYSTEM_ACCESS_KEY yanlış
    // 403: Origin listede yok veya İmza geçersiz
  }
}
```

## Güvenlik Mantığı (Nasıl Çalışır?)

1.  **İmzalı İstek (Signed Request):** Helper fonksiyonu, isteği göndermeden önce `SYSTEM_ACCESS_KEY` kullanarak bir imza oluşturur.
2.  **Header:** Bu imza (`x-flowcloud-signature`) ve zaman damgası (`x-flowcloud-date`) isteğin başlığına eklenir.
3.  **Doğrulama:** FlowCloud sunucusu gelen imzayı kontrol eder.
    *   İmza doğruysa (yani şifreyi biliyorsanız),
    *   Zaman damgası yeniyse (5 dakika içinde),
    *   Ve Origin'iniz izinli listedeyse...
4.  **Sonuç:** Dosya gönderilir.

**Avantajı:** Sunucunuzun dışarıya açık bir endpoint (`/flowcloud-auth`) kurmasına gerek kalmaz. Şifre asla ağ üzerinden gönderilmez.
