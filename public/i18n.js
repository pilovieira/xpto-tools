/* XPTO Tools — internationalisation.
   Pages are written in English; every visible string is looked up here by its English text.
   - Static markup and anything rendered later is translated by a DOM walker + MutationObserver.
   - Strings with variables use X.t('Total: {from} → {to}', { from, to }).
   To add a language: add it to LANGS and append one entry to every row of ROWS (same order).
   A string with no row simply stays in English. */
(function () {
  'use strict';

  const LANGS = [
    ['en', 'English'], ['pt', 'Português'], ['es', 'Español'], ['fr', 'Français'],
    ['de', 'Deutsch'], ['it', 'Italiano'], ['ja', '日本語'], ['zh', '中文']
  ];

  /* Column order: en, pt, es, fr, de, it, ja, zh */
  const ROWS = [
    /* ── Chrome ── */
    ['Admin', 'Admin', 'Admin', 'Admin', 'Admin', 'Admin', '管理', '管理'],
    ['Toggle theme', 'Alternar tema', 'Cambiar tema', 'Changer de thème', 'Design wechseln', 'Cambia tema', 'テーマを切り替え', '切换主题'],
    ['Language', 'Idioma', 'Idioma', 'Langue', 'Sprache', 'Lingua', '言語', '语言'],
    ['XPTO Tools — built for developers', 'XPTO Tools — feito para desenvolvedores', 'XPTO Tools — hecho para desarrolladores', 'XPTO Tools — conçu pour les développeurs', 'XPTO Tools — für Entwickler gebaut', 'XPTO Tools — pensato per gli sviluppatori', 'XPTO Tools — 開発者のために', 'XPTO Tools — 为开发者打造'],

    /* ── Home ── */
    ['Developer toolbox', 'Caixa de ferramentas', 'Caja de herramientas', 'Boîte à outils', 'Werkzeugkasten', 'Cassetta degli attrezzi', '開発者ツールボックス', '开发者工具箱'],
    ['Small tools,', 'Ferramentas pequenas,', 'Herramientas pequeñas,', 'Des petits outils,', 'Kleine Tools,', 'Piccoli strumenti,', '小さなツールで、', '小工具，'],
    ['sharp results.', 'resultados afiados.', 'resultados precisos.', 'des résultats précis.', 'scharfe Ergebnisse.', 'risultati precisi.', '確かな結果を。', '精准结果。'],
    ['Fast, no-nonsense utilities for everyday work. Most of them run entirely in your browser.', 'Utilitários rápidos e diretos para o dia a dia. A maioria roda inteiramente no seu navegador.', 'Utilidades rápidas y sin rodeos para el trabajo diario. La mayoría se ejecuta por completo en tu navegador.', 'Des utilitaires rapides et efficaces pour le quotidien. La plupart fonctionnent entièrement dans votre navigateur.', 'Schnelle, unkomplizierte Helfer für den Alltag. Die meisten laufen komplett in deinem Browser.', 'Utility rapide e senza fronzoli per il lavoro di tutti i giorni. La maggior parte funziona interamente nel browser.', '日々の作業に役立つ、シンプルで高速なユーティリティ。ほとんどはブラウザ内で完結します。', '日常工作所需的快速实用工具，大多数完全在浏览器中运行。'],
    ['Search tools…', 'Buscar ferramentas…', 'Buscar herramientas…', 'Rechercher un outil…', 'Tools durchsuchen…', 'Cerca strumenti…', 'ツールを検索…', '搜索工具…'],
    ['Search tools', 'Buscar ferramentas', 'Buscar herramientas', 'Rechercher un outil', 'Tools durchsuchen', 'Cerca strumenti', 'ツールを検索', '搜索工具'],
    ['No tools match your search', 'Nenhuma ferramenta encontrada', 'Ninguna herramienta coincide con tu búsqueda', 'Aucun outil ne correspond à votre recherche', 'Keine passenden Tools gefunden', 'Nessuno strumento corrisponde alla ricerca', '一致するツールがありません', '没有匹配的工具'],
    ['Try a different keyword.', 'Tente outra palavra-chave.', 'Prueba con otra palabra clave.', 'Essayez un autre mot-clé.', 'Versuche ein anderes Stichwort.', 'Prova con un’altra parola chiave.', '別のキーワードをお試しください。', '请尝试其他关键词。'],
    ['Open', 'Abrir', 'Abrir', 'Ouvrir', 'Öffnen', 'Apri', '開く', '打开'],

    /* ── Tool registry: names ── */
    ['URL Shortener', 'Encurtador de URL', 'Acortador de URL', 'Raccourcisseur d’URL', 'URL-Kürzer', 'Accorcia URL', 'URL短縮', '网址缩短'],
    ['Base58 Converter', 'Conversor Base58', 'Conversor Base58', 'Convertisseur Base58', 'Base58-Konverter', 'Convertitore Base58', 'Base58変換', 'Base58 转换器'],
    ['Token Generator', 'Gerador de tokens', 'Generador de tokens', 'Générateur de jetons', 'Token-Generator', 'Generatore di token', 'トークン生成', '令牌生成器'],
    ['JSON Formatter', 'Formatador de JSON', 'Formateador de JSON', 'Formateur JSON', 'JSON-Formatierer', 'Formattatore JSON', 'JSON整形', 'JSON 格式化'],
    ['PDF Splitter', 'Divisor de PDF', 'Divisor de PDF', 'Découpeur de PDF', 'PDF-Splitter', 'Divisore PDF', 'PDF分割', 'PDF 拆分'],
    ['PDF Signer', 'Assinador de PDF', 'Firmador de PDF', 'Signature de PDF', 'PDF-Signierer', 'Firma PDF', 'PDF署名', 'PDF 签名'],
    ['Image to PDF', 'Imagem para PDF', 'Imagen a PDF', 'Image en PDF', 'Bild zu PDF', 'Immagine in PDF', '画像からPDF', '图片转 PDF'],
    ['Image Compressor', 'Compressor de imagens', 'Compresor de imágenes', 'Compresseur d’images', 'Bildkomprimierer', 'Compressore di immagini', '画像圧縮', '图片压缩'],

    /* ── Tool registry: descriptions ── */
    ['Turn long URLs into short, shareable links with click tracking.', 'Transforme URLs longas em links curtos e compartilháveis, com contagem de cliques.', 'Convierte URLs largas en enlaces cortos y compartibles con seguimiento de clics.', 'Transformez de longues URL en liens courts à partager, avec suivi des clics.', 'Verwandle lange URLs in kurze, teilbare Links mit Klick-Tracking.', 'Trasforma URL lunghe in link brevi da condividere, con conteggio dei clic.', '長いURLを、クリック数を追跡できる短い共有リンクに変換します。', '将长网址变成可分享的短链接，并统计点击量。'],
    ['Encode text to Base58 and decode it back — the Bitcoin alphabet, no lookalike characters.', 'Codifique texto em Base58 e decodifique de volta — o alfabeto do Bitcoin, sem caracteres parecidos.', 'Codifica texto a Base58 y decodifícalo de nuevo: el alfabeto de Bitcoin, sin caracteres parecidos.', 'Encodez du texte en Base58 et décodez-le — l’alphabet Bitcoin, sans caractères ambigus.', 'Text in Base58 kodieren und zurück dekodieren — das Bitcoin-Alphabet, ohne verwechselbare Zeichen.', 'Codifica il testo in Base58 e decodificalo — l’alfabeto di Bitcoin, senza caratteri ambigui.', 'テキストをBase58にエンコード／デコード。紛らわしい文字のないBitcoinのアルファベットです。', '将文本编码为 Base58 并解码——比特币字母表，没有易混淆字符。'],
    ['Generate secure random tokens in your browser: hex, base64, base62, UUID and more.', 'Gere tokens aleatórios seguros no navegador: hex, base64, base62, UUID e mais.', 'Genera tokens aleatorios seguros en tu navegador: hex, base64, base62, UUID y más.', 'Générez des jetons aléatoires sécurisés dans votre navigateur : hex, base64, base62, UUID, etc.', 'Erzeuge sichere Zufalls-Tokens im Browser: Hex, Base64, Base62, UUID und mehr.', 'Genera token casuali sicuri nel browser: hex, base64, base62, UUID e altro.', 'ブラウザ上で安全なランダムトークンを生成：hex、base64、base62、UUIDなど。', '在浏览器中生成安全随机令牌：hex、base64、base62、UUID 等。'],
    ['Format, minify and validate JSON with precise error locations. Runs entirely in your browser.', 'Formate, minifique e valide JSON com localização exata dos erros. Roda inteiramente no navegador.', 'Formatea, minimiza y valida JSON con ubicación exacta de los errores. Se ejecuta por completo en tu navegador.', 'Formatez, minifiez et validez du JSON avec la position exacte des erreurs. Fonctionne entièrement dans votre navigateur.', 'JSON formatieren, minimieren und validieren – mit genauer Fehlerposition. Läuft komplett im Browser.', 'Formatta, minimizza e valida JSON con la posizione esatta degli errori. Funziona interamente nel browser.', 'JSONの整形・圧縮・検証。エラー位置を正確に表示。すべてブラウザ内で動作します。', '格式化、压缩并校验 JSON，精确定位错误。完全在浏览器中运行。'],
    ['Split a PDF into one file per page and download them individually or as a ZIP.', 'Divida um PDF em um arquivo por página e baixe individualmente ou em ZIP.', 'Divide un PDF en un archivo por página y descárgalos por separado o en un ZIP.', 'Découpez un PDF en un fichier par page et téléchargez-les séparément ou en ZIP.', 'Teile ein PDF in eine Datei pro Seite und lade sie einzeln oder als ZIP herunter.', 'Dividi un PDF in un file per pagina e scaricali singolarmente o in ZIP.', 'PDFをページごとのファイルに分割し、個別またはZIPでダウンロードできます。', '将 PDF 拆分为每页一个文件，可单独下载或打包为 ZIP。'],
    ['Place your signature image anywhere on a PDF. Everything happens in your browser.', 'Posicione a imagem da sua assinatura em qualquer lugar do PDF. Tudo acontece no navegador.', 'Coloca la imagen de tu firma en cualquier parte del PDF. Todo ocurre en tu navegador.', 'Placez l’image de votre signature n’importe où sur un PDF. Tout se passe dans votre navigateur.', 'Platziere dein Unterschriftsbild an beliebiger Stelle im PDF. Alles passiert im Browser.', 'Posiziona l’immagine della tua firma ovunque nel PDF. Tutto avviene nel browser.', '署名画像をPDFの好きな位置に配置。処理はすべてブラウザ内で行われます。', '把签名图片放到 PDF 的任意位置。所有操作都在浏览器中完成。'],
    ['Combine images into a single PDF, reorder the pages and pick the page size.', 'Combine imagens em um único PDF, reordene as páginas e escolha o tamanho da página.', 'Combina imágenes en un único PDF, reordena las páginas y elige el tamaño de página.', 'Combinez des images en un seul PDF, réorganisez les pages et choisissez le format.', 'Kombiniere Bilder zu einem PDF, ordne die Seiten neu und wähle das Seitenformat.', 'Unisci le immagini in un unico PDF, riordina le pagine e scegli il formato.', '複数の画像を1つのPDFにまとめ、ページ順とサイズを選べます。', '将多张图片合并为一个 PDF，可调整页面顺序并选择页面尺寸。'],
    ['Shrink photos to a target size in MB so any website accepts them. Compression runs in your browser.', 'Reduza fotos para um tamanho-alvo em MB para qualquer site aceitá-las. A compressão roda no navegador.', 'Reduce fotos a un tamaño objetivo en MB para que cualquier sitio las acepte. La compresión se ejecuta en tu navegador.', 'Réduisez vos photos à une taille cible en Mo pour que n’importe quel site les accepte. La compression s’effectue dans votre navigateur.', 'Verkleinere Fotos auf eine Zielgröße in MB, damit jede Website sie akzeptiert. Die Komprimierung läuft im Browser.', 'Riduci le foto a una dimensione obiettivo in MB perché qualsiasi sito le accetti. La compressione avviene nel browser.', '写真を指定のMBサイズまで縮小し、どのサイトでもアップロードできるように。圧縮はブラウザ内で行われます。', '把照片压缩到目标 MB 大小，让任何网站都能接受。压缩在浏览器中完成。'],
    ['Usage and error statistics for the JSON formatter.', 'Estatísticas de uso e erros do formatador de JSON.', 'Estadísticas de uso y errores del formateador de JSON.', 'Statistiques d’utilisation et d’erreurs du formateur JSON.', 'Nutzungs- und Fehlerstatistiken des JSON-Formatierers.', 'Statistiche di utilizzo ed errori del formattatore JSON.', 'JSON整形ツールの利用状況とエラー統計。', 'JSON 格式化工具的使用与错误统计。'],

    /* ── Tool registry: chips ── */
    ['Short links', 'Links curtos', 'Enlaces cortos', 'Liens courts', 'Kurze Links', 'Link brevi', '短縮リンク', '短链接'],
    ['Click tracking', 'Contagem de cliques', 'Seguimiento de clics', 'Suivi des clics', 'Klick-Tracking', 'Conteggio clic', 'クリック追跡', '点击统计'],
    ['Instant redirect', 'Redirecionamento instantâneo', 'Redirección instantánea', 'Redirection instantanée', 'Sofortige Weiterleitung', 'Reindirizzamento immediato', '即時リダイレクト', '即时跳转'],
    ['Encode', 'Codificar', 'Codificar', 'Encoder', 'Kodieren', 'Codifica', 'エンコード', '编码'],
    ['Decode', 'Decodificar', 'Decodificar', 'Décoder', 'Dekodieren', 'Decodifica', 'デコード', '解码'],
    ['UTF-8 safe', 'Seguro com UTF-8', 'Compatible con UTF-8', 'Compatible UTF-8', 'UTF-8-sicher', 'Sicuro con UTF-8', 'UTF-8対応', '支持 UTF-8'],
    ['Crypto-secure', 'Criptograficamente seguro', 'Criptográficamente seguro', 'Sécurisé cryptographiquement', 'Kryptografisch sicher', 'Crittograficamente sicuro', '暗号学的に安全', '密码学安全'],
    ['Custom format', 'Formato personalizado', 'Formato personalizado', 'Format personnalisé', 'Eigenes Format', 'Formato personalizzato', 'カスタム形式', '自定义格式'],
    ['Bulk export', 'Exportação em massa', 'Exportación masiva', 'Export en masse', 'Massenexport', 'Esportazione in blocco', '一括エクスポート', '批量导出'],
    ['Pretty print', 'Formatação legível', 'Formato legible', 'Mise en forme', 'Schön formatiert', 'Formattazione leggibile', '整形表示', '美化输出'],
    ['Minify', 'Minificar', 'Minificar', 'Minifier', 'Minimieren', 'Minimizza', '圧縮', '压缩'],
    ['Sort keys', 'Ordenar chaves', 'Ordenar claves', 'Trier les clés', 'Schlüssel sortieren', 'Ordina le chiavi', 'キーを並べ替え', '排序键'],
    ['One PDF per page', 'Um PDF por página', 'Un PDF por página', 'Un PDF par page', 'Ein PDF pro Seite', 'Un PDF per pagina', 'ページごとにPDF', '每页一个 PDF'],
    ['ZIP download', 'Download em ZIP', 'Descarga en ZIP', 'Téléchargement ZIP', 'ZIP-Download', 'Download in ZIP', 'ZIPダウンロード', 'ZIP 下载'],
    ['Up to 50 MB', 'Até 50 MB', 'Hasta 50 MB', 'Jusqu’à 50 Mo', 'Bis zu 50 MB', 'Fino a 50 MB', '最大50MB', '最大 50 MB'],
    ['Drag & resize', 'Arrastar e redimensionar', 'Arrastrar y redimensionar', 'Glisser et redimensionner', 'Ziehen & skalieren', 'Trascina e ridimensiona', 'ドラッグ＆リサイズ', '拖动并缩放'],
    ['Multi-page', 'Várias páginas', 'Varias páginas', 'Multi-pages', 'Mehrseitig', 'Più pagine', '複数ページ', '多页'],
    ['Private', 'Privado', 'Privado', 'Privé', 'Privat', 'Privato', 'プライベート', '隐私安全'],
    ['PNG / JPG / WebP', 'PNG / JPG / WebP', 'PNG / JPG / WebP', 'PNG / JPG / WebP', 'PNG / JPG / WebP', 'PNG / JPG / WebP', 'PNG / JPG / WebP', 'PNG / JPG / WebP'],
    ['Reorder pages', 'Reordenar páginas', 'Reordenar páginas', 'Réorganiser les pages', 'Seiten umordnen', 'Riordina le pagine', 'ページ並べ替え', '调整页面顺序'],
    ['Target size in MB', 'Tamanho-alvo em MB', 'Tamaño objetivo en MB', 'Taille cible en Mo', 'Zielgröße in MB', 'Dimensione in MB', 'MBで目標サイズ指定', '按 MB 设定目标大小'],
    ['JPEG / WebP', 'JPEG / WebP', 'JPEG / WebP', 'JPEG / WebP', 'JPEG / WebP', 'JPEG / WebP', 'JPEG / WebP', 'JPEG / WebP'],
    ['Batch + ZIP', 'Lote + ZIP', 'Lote + ZIP', 'Lot + ZIP', 'Stapel + ZIP', 'Batch + ZIP', '一括＋ZIP', '批量 + ZIP'],

    /* ── Shared UI ── */
    ['Copy', 'Copiar', 'Copiar', 'Copier', 'Kopieren', 'Copia', 'コピー', '复制'],
    ['Copy all', 'Copiar tudo', 'Copiar todo', 'Tout copier', 'Alle kopieren', 'Copia tutto', 'すべてコピー', '全部复制'],
    ['Download', 'Baixar', 'Descargar', 'Télécharger', 'Herunterladen', 'Scarica', 'ダウンロード', '下载'],
    ['Remove', 'Remover', 'Quitar', 'Retirer', 'Entfernen', 'Rimuovi', '削除', '移除'],
    ['Add more', 'Adicionar mais', 'Añadir más', 'Ajouter', 'Mehr hinzufügen', 'Aggiungi altri', 'さらに追加', '继续添加'],
    ['Clear all', 'Limpar tudo', 'Borrar todo', 'Tout effacer', 'Alles löschen', 'Cancella tutto', 'すべてクリア', '全部清除'],
    ['Download all as ZIP', 'Baixar tudo em ZIP', 'Descargar todo en ZIP', 'Tout télécharger en ZIP', 'Alles als ZIP laden', 'Scarica tutto in ZIP', 'すべてZIPでダウンロード', '全部打包下载 ZIP'],
    ['ZIP download started', 'Download do ZIP iniciado', 'Descarga del ZIP iniciada', 'Téléchargement du ZIP lancé', 'ZIP-Download gestartet', 'Download ZIP avviato', 'ZIPのダウンロードを開始しました', 'ZIP 开始下载'],
    ['Failed to build ZIP: {msg}', 'Falha ao gerar o ZIP: {msg}', 'No se pudo crear el ZIP: {msg}', 'Échec de la création du ZIP : {msg}', 'ZIP konnte nicht erstellt werden: {msg}', 'Impossibile creare lo ZIP: {msg}', 'ZIPの作成に失敗しました：{msg}', '生成 ZIP 失败：{msg}'],
    ['Copied to clipboard', 'Copiado para a área de transferência', 'Copiado al portapapeles', 'Copié dans le presse-papiers', 'In die Zwischenablage kopiert', 'Copiato negli appunti', 'クリップボードにコピーしました', '已复制到剪贴板'],
    ['Could not copy to clipboard', 'Não foi possível copiar', 'No se pudo copiar', 'Copie impossible', 'Kopieren nicht möglich', 'Impossibile copiare', 'コピーできませんでした', '无法复制'],
    ['Processing…', 'Processando…', 'Procesando…', 'Traitement…', 'Verarbeitung…', 'Elaborazione…', '処理中…', '处理中…'],
    ['Working…', 'Trabalhando…', 'Trabajando…', 'Traitement…', 'Wird bearbeitet…', 'Elaborazione…', '処理中…', '处理中…'],
    ['Page', 'Página', 'Página', 'Page', 'Seite', 'Pagina', 'ページ', '页'],
    ['Page {n}', 'Página {n}', 'Página {n}', 'Page {n}', 'Seite {n}', 'Pagina {n}', '{n}ページ', '第 {n} 页'],
    ['{n} page', '{n} página', '{n} página', '{n} page', '{n} Seite', '{n} pagina', '{n}ページ', '{n} 页'],
    ['{n} pages', '{n} páginas', '{n} páginas', '{n} pages', '{n} Seiten', '{n} pagine', '{n}ページ', '{n} 页'],
    ['{n} image', '{n} imagem', '{n} imagen', '{n} image', '{n} Bild', '{n} immagine', '{n}枚', '{n} 张图片'],
    ['{n} images', '{n} imagens', '{n} imágenes', '{n} images', '{n} Bilder', '{n} immagini', '{n}枚', '{n} 张图片'],
    ['Something went wrong. Please try again.', 'Algo deu errado. Tente novamente.', 'Algo salió mal. Inténtalo de nuevo.', 'Une erreur est survenue. Veuillez réessayer.', 'Etwas ist schiefgelaufen. Bitte versuche es erneut.', 'Qualcosa è andato storto. Riprova.', 'エラーが発生しました。もう一度お試しください。', '出错了，请重试。'],

    /* ── Server messages shown to users ── */
    ['Please enter a valid http(s) URL.', 'Informe uma URL http(s) válida.', 'Introduce una URL http(s) válida.', 'Saisissez une URL http(s) valide.', 'Bitte gib eine gültige http(s)-URL ein.', 'Inserisci un URL http(s) valido.', '有効なhttp(s) URLを入力してください。', '请输入有效的 http(s) 网址。'],
    ['Could not allocate a key, please try again.', 'Não foi possível gerar uma chave, tente novamente.', 'No se pudo asignar una clave, inténtalo de nuevo.', 'Impossible d’attribuer une clé, veuillez réessayer.', 'Schlüssel konnte nicht vergeben werden, bitte erneut versuchen.', 'Impossibile assegnare una chiave, riprova.', 'キーを割り当てられませんでした。もう一度お試しください。', '无法分配密钥，请重试。'],
    ['Too many requests, slow down.', 'Muitas requisições, vá com calma.', 'Demasiadas solicitudes, ve más despacio.', 'Trop de requêtes, ralentissez.', 'Zu viele Anfragen, bitte langsamer.', 'Troppe richieste, rallenta.', 'リクエストが多すぎます。少し待ってください。', '请求过多，请稍后再试。'],
    ['Too many login attempts. Try again in a few minutes.', 'Muitas tentativas de login. Tente novamente em alguns minutos.', 'Demasiados intentos de acceso. Inténtalo de nuevo en unos minutos.', 'Trop de tentatives de connexion. Réessayez dans quelques minutes.', 'Zu viele Anmeldeversuche. Versuche es in einigen Minuten erneut.', 'Troppi tentativi di accesso. Riprova tra qualche minuto.', 'ログイン試行が多すぎます。数分後にお試しください。', '登录尝试次数过多，请几分钟后再试。'],
    ['Payload too large', 'Conteúdo grande demais', 'Contenido demasiado grande', 'Contenu trop volumineux', 'Inhalt zu groß', 'Contenuto troppo grande', 'データが大きすぎます', '内容过大'],
    ['Bad request', 'Requisição inválida', 'Solicitud no válida', 'Requête invalide', 'Ungültige Anfrage', 'Richiesta non valida', '不正なリクエスト', '请求无效'],
    ['Internal server error', 'Erro interno do servidor', 'Error interno del servidor', 'Erreur interne du serveur', 'Interner Serverfehler', 'Errore interno del server', 'サーバー内部エラー', '服务器内部错误'],
    ['Unauthorized', 'Não autorizado', 'No autorizado', 'Non autorisé', 'Nicht autorisiert', 'Non autorizzato', '認証されていません', '未授权'],
    ['Invalid credentials', 'Credenciais inválidas', 'Credenciales no válidas', 'Identifiants invalides', 'Ungültige Zugangsdaten', 'Credenziali non valide', '認証情報が正しくありません', '凭据无效'],
    ['Request body is not a supported image', 'O conteúdo enviado não é uma imagem compatível', 'El contenido enviado no es una imagen compatible', 'Le contenu envoyé n’est pas une image prise en charge', 'Der Inhalt ist kein unterstütztes Bild', 'Il contenuto inviato non è un’immagine supportata', '送信された内容は対応する画像ではありません', '提交的内容不是受支持的图片'],

    /* ── URL Shortener ── */
    ['Destination URL', 'URL de destino', 'URL de destino', 'URL de destination', 'Ziel-URL', 'URL di destinazione', '転送先URL', '目标网址'],
    ['Shorten URL', 'Encurtar URL', 'Acortar URL', 'Raccourcir l’URL', 'URL kürzen', 'Accorcia URL', 'URLを短縮', '缩短网址'],
    ['Shortening…', 'Encurtando…', 'Acortando…', 'Raccourcissement…', 'Wird gekürzt…', 'Accorciamento…', '短縮中…', '正在缩短…'],
    ['Enter a URL to shorten.', 'Informe uma URL para encurtar.', 'Introduce una URL para acortar.', 'Saisissez une URL à raccourcir.', 'Gib eine URL zum Kürzen ein.', 'Inserisci un URL da accorciare.', '短縮するURLを入力してください。', '请输入要缩短的网址。'],
    ['Your short link', 'Seu link curto', 'Tu enlace corto', 'Votre lien court', 'Dein Kurzlink', 'Il tuo link breve', '短縮リンク', '你的短链接'],
    ['Short link copied', 'Link curto copiado', 'Enlace corto copiado', 'Lien court copié', 'Kurzlink kopiert', 'Link breve copiato', '短縮リンクをコピーしました', '短链接已复制'],
    ['Shorten another', 'Encurtar outra', 'Acortar otra', 'En raccourcir un autre', 'Weitere kürzen', 'Accorcia un altro', '別のURLを短縮', '再缩短一个'],

    /* ── Base58 ── */
    ['Plain text → Base58', 'Texto simples → Base58', 'Texto plano → Base58', 'Texte brut → Base58', 'Klartext → Base58', 'Testo semplice → Base58', 'プレーンテキスト → Base58', '纯文本 → Base58'],
    ['Base58 → plain text', 'Base58 → texto simples', 'Base58 → texto plano', 'Base58 → texte brut', 'Base58 → Klartext', 'Base58 → testo semplice', 'Base58 → プレーンテキスト', 'Base58 → 纯文本'],
    ['Bitcoin alphabet', 'Alfabeto Bitcoin', 'Alfabeto Bitcoin', 'Alphabet Bitcoin', 'Bitcoin-Alphabet', 'Alfabeto Bitcoin', 'Bitcoinのアルファベット', '比特币字母表'],
    ['Source text', 'Texto de origem', 'Texto de origen', 'Texte source', 'Quelltext', 'Testo sorgente', '元のテキスト', '源文本'],
    ['Type or paste text to encode…', 'Digite ou cole o texto para codificar…', 'Escribe o pega el texto a codificar…', 'Saisissez ou collez le texte à encoder…', 'Text zum Kodieren eingeben oder einfügen…', 'Scrivi o incolla il testo da codificare…', 'エンコードするテキストを入力または貼り付け…', '输入或粘贴要编码的文本…'],
    ['Encode to Base58', 'Codificar em Base58', 'Codificar a Base58', 'Encoder en Base58', 'In Base58 kodieren', 'Codifica in Base58', 'Base58にエンコード', '编码为 Base58'],
    ['Base58 output', 'Saída Base58', 'Salida Base58', 'Sortie Base58', 'Base58-Ausgabe', 'Output Base58', 'Base58出力', 'Base58 输出'],
    ['Output will appear here…', 'O resultado aparecerá aqui…', 'El resultado aparecerá aquí…', 'Le résultat s’affichera ici…', 'Die Ausgabe erscheint hier…', 'L’output apparirà qui…', 'ここに結果が表示されます…', '结果将显示在这里…'],
    ['Base58 string', 'Texto Base58', 'Cadena Base58', 'Chaîne Base58', 'Base58-Zeichenfolge', 'Stringa Base58', 'Base58文字列', 'Base58 字符串'],
    ['Paste a Base58 string to decode…', 'Cole um texto Base58 para decodificar…', 'Pega una cadena Base58 para decodificar…', 'Collez une chaîne Base58 à décoder…', 'Base58-Zeichenfolge zum Dekodieren einfügen…', 'Incolla una stringa Base58 da decodificare…', 'デコードするBase58文字列を貼り付け…', '粘贴要解码的 Base58 字符串…'],
    ['Decode Base58', 'Decodificar Base58', 'Decodificar Base58', 'Décoder le Base58', 'Base58 dekodieren', 'Decodifica Base58', 'Base58をデコード', '解码 Base58'],
    ['Decoded text', 'Texto decodificado', 'Texto decodificado', 'Texte décodé', 'Dekodierter Text', 'Testo decodificato', 'デコード結果', '解码后的文本'],
    ['Non-Base58 character: {c}', 'Caractere fora do Base58: {c}', 'Carácter no válido en Base58: {c}', 'Caractère hors Base58 : {c}', 'Kein Base58-Zeichen: {c}', 'Carattere non Base58: {c}', 'Base58以外の文字：{c}', '非 Base58 字符：{c}'],
    ['Encoding failed: {msg}', 'Falha ao codificar: {msg}', 'Error al codificar: {msg}', 'Échec de l’encodage : {msg}', 'Kodierung fehlgeschlagen: {msg}', 'Codifica non riuscita: {msg}', 'エンコードに失敗しました：{msg}', '编码失败：{msg}'],
    ['Invalid Base58 string: {msg}', 'Texto Base58 inválido: {msg}', 'Cadena Base58 no válida: {msg}', 'Chaîne Base58 invalide : {msg}', 'Ungültige Base58-Zeichenfolge: {msg}', 'Stringa Base58 non valida: {msg}', '無効なBase58文字列：{msg}', '无效的 Base58 字符串：{msg}'],

    /* ── Token Generator ── */
    ['Configuration', 'Configuração', 'Configuración', 'Configuration', 'Konfiguration', 'Configurazione', '設定', '配置'],
    ['Token type', 'Tipo de token', 'Tipo de token', 'Type de jeton', 'Token-Typ', 'Tipo di token', 'トークンの種類', '令牌类型'],
    ['Numeric', 'Numérico', 'Numérico', 'Numérique', 'Numerisch', 'Numerico', '数字', '数字'],
    ['Alphanum', 'Alfanum.', 'Alfanum.', 'Alphanum.', 'Alphanum.', 'Alfanum.', '英数字', '字母数字'],
    ['Length', 'Tamanho', 'Longitud', 'Longueur', 'Länge', 'Lunghezza', '長さ', '长度'],
    ['Quantity', 'Quantidade', 'Cantidad', 'Quantité', 'Anzahl', 'Quantità', '個数', '数量'],
    ['Prefix', 'Prefixo', 'Prefijo', 'Préfixe', 'Präfix', 'Prefisso', '接頭辞', '前缀'],
    ['e.g. tok_', 'ex.: tok_', 'p. ej. tok_', 'ex. : tok_', 'z. B. tok_', 'es. tok_', '例：tok_', '例如 tok_'],
    ['Separator', 'Separador', 'Separador', 'Séparateur', 'Trennzeichen', 'Separatore', '区切り文字', '分隔符'],
    ['None', 'Nenhum', 'Ninguno', 'Aucun', 'Keins', 'Nessuno', 'なし', '无'],
    ['Dash', 'Hífen', 'Guion', 'Tiret', 'Bindestrich', 'Trattino', 'ハイフン', '连字符'],
    ['Underscore', 'Sublinhado', 'Guion bajo', 'Tiret bas', 'Unterstrich', 'Trattino basso', 'アンダースコア', '下划线'],
    ['Dot', 'Ponto', 'Punto', 'Point', 'Punkt', 'Punto', 'ドット', '点'],
    ['Group every', 'Agrupar a cada', 'Agrupar cada', 'Grouper tous les', 'Gruppieren alle', 'Raggruppa ogni', 'グループ化の間隔', '每隔几位分组'],
    ['off', 'desligado', 'desactivado', 'désactivé', 'aus', 'disattivato', 'オフ', '关闭'],
    ['Generate tokens', 'Gerar tokens', 'Generar tokens', 'Générer des jetons', 'Tokens erzeugen', 'Genera token', 'トークンを生成', '生成令牌'],
    ['Generated tokens', 'Tokens gerados', 'Tokens generados', 'Jetons générés', 'Erzeugte Tokens', 'Token generati', '生成されたトークン', '已生成的令牌'],
    ['Everything is generated in your browser with the Web Crypto API.', 'Tudo é gerado no seu navegador com a Web Crypto API.', 'Todo se genera en tu navegador con la Web Crypto API.', 'Tout est généré dans votre navigateur avec l’API Web Crypto.', 'Alles wird in deinem Browser mit der Web Crypto API erzeugt.', 'Tutto viene generato nel browser con la Web Crypto API.', 'すべてWeb Crypto APIを使ってブラウザ内で生成されます。', '全部通过 Web Crypto API 在浏览器中生成。'],
    ['No tokens yet', 'Nenhum token ainda', 'Aún no hay tokens', 'Aucun jeton pour l’instant', 'Noch keine Tokens', 'Ancora nessun token', 'トークンはまだありません', '还没有令牌'],
    ['Choose your options and press “Generate tokens”.', 'Escolha as opções e clique em “Gerar tokens”.', 'Elige tus opciones y pulsa “Generar tokens”.', 'Choisissez vos options et cliquez sur « Générer des jetons ».', 'Wähle deine Optionen und klicke auf „Tokens erzeugen“.', 'Scegli le opzioni e premi “Genera token”.', 'オプションを選んで「トークンを生成」を押してください。', '选择选项后点击“生成令牌”。'],
    ['Click to copy', 'Clique para copiar', 'Haz clic para copiar', 'Cliquez pour copier', 'Zum Kopieren klicken', 'Clicca per copiare', 'クリックでコピー', '点击复制'],
    ['All tokens copied', 'Todos os tokens copiados', 'Todos los tokens copiados', 'Tous les jetons copiés', 'Alle Tokens kopiert', 'Tutti i token copiati', 'すべてのトークンをコピーしました', '已复制全部令牌'],
    ['Tokens file downloaded', 'Arquivo de tokens baixado', 'Archivo de tokens descargado', 'Fichier de jetons téléchargé', 'Token-Datei heruntergeladen', 'File dei token scaricato', 'トークンファイルをダウンロードしました', '令牌文件已下载'],
    ['{n} {type} token in {ms} ms · generated in your browser', '{n} token {type} em {ms} ms · gerado no seu navegador', '{n} token {type} en {ms} ms · generado en tu navegador', '{n} jeton {type} en {ms} ms · généré dans votre navigateur', '{n} {type}-Token in {ms} ms · in deinem Browser erzeugt', '{n} token {type} in {ms} ms · generato nel browser', '{type}トークン{n}個（{ms} ms）· ブラウザ内で生成', '{n} 个 {type} 令牌，用时 {ms} ms · 在浏览器中生成'],
    ['{n} {type} tokens in {ms} ms · generated in your browser', '{n} tokens {type} em {ms} ms · gerados no seu navegador', '{n} tokens {type} en {ms} ms · generados en tu navegador', '{n} jetons {type} en {ms} ms · générés dans votre navigateur', '{n} {type}-Tokens in {ms} ms · in deinem Browser erzeugt', '{n} token {type} in {ms} ms · generati nel browser', '{type}トークン{n}個（{ms} ms）· ブラウザ内で生成', '{n} 个 {type} 令牌，用时 {ms} ms · 在浏览器中生成'],

    /* ── JSON Formatter ── */
    ['Indentation', 'Indentação', 'Sangría', 'Indentation', 'Einrückung', 'Indentazione', 'インデント', '缩进'],
    ['2 spaces', '2 espaços', '2 espacios', '2 espaces', '2 Leerzeichen', '2 spazi', 'スペース2', '2 个空格'],
    ['4 spaces', '4 espaços', '4 espacios', '4 espaces', '4 Leerzeichen', '4 spazi', 'スペース4', '4 个空格'],
    ['Tab', 'Tab', 'Tab', 'Tab', 'Tab', 'Tab', 'タブ', '制表符'],
    ['Format', 'Formatar', 'Formatear', 'Formater', 'Formatieren', 'Formatta', '整形', '格式化'],
    ['Sample', 'Exemplo', 'Ejemplo', 'Exemple', 'Beispiel', 'Esempio', 'サンプル', '示例'],
    ['Input', 'Entrada', 'Entrada', 'Entrée', 'Eingabe', 'Input', '入力', '输入'],
    ['Output', 'Saída', 'Salida', 'Sortie', 'Ausgabe', 'Output', '出力', '输出'],
    ['Paste JSON here, e.g. {"hello": "world"}', 'Cole o JSON aqui, ex.: {"hello": "world"}', 'Pega el JSON aquí, p. ej. {"hello": "world"}', 'Collez le JSON ici, ex. : {"hello": "world"}', 'JSON hier einfügen, z. B. {"hello": "world"}', 'Incolla qui il JSON, es. {"hello": "world"}', 'ここにJSONを貼り付け（例：{"hello": "world"}）', '在此粘贴 JSON，例如 {"hello": "world"}'],
    ['Result will appear here…', 'O resultado aparecerá aqui…', 'El resultado aparecerá aquí…', 'Le résultat s’affichera ici…', 'Das Ergebnis erscheint hier…', 'Il risultato apparirà qui…', 'ここに結果が表示されます…', '结果将显示在这里…'],
    ['Use as input', 'Usar como entrada', 'Usar como entrada', 'Utiliser comme entrée', 'Als Eingabe verwenden', 'Usa come input', '入力に使う', '用作输入'],
    ['Use output as input', 'Usar a saída como entrada', 'Usar la salida como entrada', 'Utiliser la sortie comme entrée', 'Ausgabe als Eingabe verwenden', 'Usa l’output come input', '出力を入力として使う', '将输出用作输入'],
    ['Paste some JSON first.', 'Cole algum JSON primeiro.', 'Pega primero algo de JSON.', 'Collez d’abord du JSON.', 'Füge zuerst JSON ein.', 'Incolla prima del JSON.', '先にJSONを貼り付けてください。', '请先粘贴 JSON。'],
    ['Valid JSON', 'JSON válido', 'JSON válido', 'JSON valide', 'Gültiges JSON', 'JSON valido', '有効なJSON', '有效的 JSON'],
    ['Invalid JSON', 'JSON inválido', 'JSON no válido', 'JSON invalide', 'Ungültiges JSON', 'JSON non valido', '無効なJSON', '无效的 JSON'],
    ['Invalid JSON — line {line}, column {col}', 'JSON inválido — linha {line}, coluna {col}', 'JSON no válido — línea {line}, columna {col}', 'JSON invalide — ligne {line}, colonne {col}', 'Ungültiges JSON — Zeile {line}, Spalte {col}', 'JSON non valido — riga {line}, colonna {col}', '無効なJSON — {line}行目、{col}列目', '无效的 JSON — 第 {line} 行，第 {col} 列'],
    ['JSON copied', 'JSON copiado', 'JSON copiado', 'JSON copié', 'JSON kopiert', 'JSON copiato', 'JSONをコピーしました', 'JSON 已复制'],
    ['Nothing to copy yet', 'Nada para copiar ainda', 'Aún no hay nada que copiar', 'Rien à copier pour l’instant', 'Noch nichts zu kopieren', 'Ancora niente da copiare', 'コピーする内容がありません', '暂无可复制的内容'],
    ['Nothing to download yet', 'Nada para baixar ainda', 'Aún no hay nada que descargar', 'Rien à télécharger pour l’instant', 'Noch nichts zum Herunterladen', 'Ancora niente da scaricare', 'ダウンロードする内容がありません', '暂无可下载的内容'],

    /* ── PDF Splitter ── */
    ['Drop a PDF here, or click to browse', 'Solte um PDF aqui ou clique para escolher', 'Suelta un PDF aquí o haz clic para elegir', 'Déposez un PDF ici ou cliquez pour parcourir', 'PDF hier ablegen oder zum Auswählen klicken', 'Trascina qui un PDF o clicca per sfogliare', 'PDFをここにドロップ、またはクリックして選択', '拖放 PDF 到此处，或点击选择'],
    ['PDF files up to 50 MB', 'Arquivos PDF de até 50 MB', 'Archivos PDF de hasta 50 MB', 'Fichiers PDF jusqu’à 50 Mo', 'PDF-Dateien bis 50 MB', 'File PDF fino a 50 MB', '50MBまでのPDFファイル', '最大 50 MB 的 PDF 文件'],
    ['Reading PDF…', 'Lendo PDF…', 'Leyendo PDF…', 'Lecture du PDF…', 'PDF wird gelesen…', 'Lettura del PDF…', 'PDFを読み込み中…', '正在读取 PDF…'],
    ['Splitting pages…', 'Dividindo páginas…', 'Dividiendo páginas…', 'Découpage des pages…', 'Seiten werden getrennt…', 'Divisione delle pagine…', 'ページを分割中…', '正在拆分页面…'],
    ['Please select a PDF file.', 'Selecione um arquivo PDF.', 'Selecciona un archivo PDF.', 'Veuillez sélectionner un fichier PDF.', 'Bitte wähle eine PDF-Datei aus.', 'Seleziona un file PDF.', 'PDFファイルを選択してください。', '请选择 PDF 文件。'],
    ['That file is larger than 50 MB.', 'Esse arquivo tem mais de 50 MB.', 'Ese archivo supera los 50 MB.', 'Ce fichier dépasse 50 Mo.', 'Diese Datei ist größer als 50 MB.', 'Il file supera i 50 MB.', 'ファイルが50MBを超えています。', '该文件超过 50 MB。'],
    ['This PDF has no pages.', 'Este PDF não tem páginas.', 'Este PDF no tiene páginas.', 'Ce PDF ne contient aucune page.', 'Dieses PDF hat keine Seiten.', 'Questo PDF non ha pagine.', 'このPDFにはページがありません。', '该 PDF 没有页面。'],
    ['PDF split successfully', 'PDF dividido com sucesso', 'PDF dividido correctamente', 'PDF découpé avec succès', 'PDF erfolgreich getrennt', 'PDF diviso con successo', 'PDFを分割しました', 'PDF 拆分成功'],
    ['Could not process PDF: {msg}', 'Não foi possível processar o PDF: {msg}', 'No se pudo procesar el PDF: {msg}', 'Impossible de traiter le PDF : {msg}', 'PDF konnte nicht verarbeitet werden: {msg}', 'Impossibile elaborare il PDF: {msg}', 'PDFを処理できませんでした：{msg}', '无法处理 PDF：{msg}'],

    /* ── PDF Signer ── */
    ['Document', 'Documento', 'Documento', 'Document', 'Dokument', 'Documento', 'ドキュメント', '文档'],
    ['Drop a PDF or click to browse', 'Solte um PDF ou clique para escolher', 'Suelta un PDF o haz clic para elegir', 'Déposez un PDF ou cliquez pour parcourir', 'PDF ablegen oder zum Auswählen klicken', 'Trascina un PDF o clicca per sfogliare', 'PDFをドロップ、またはクリックして選択', '拖放 PDF 或点击选择'],
    ['Signature', 'Assinatura', 'Firma', 'Signature', 'Unterschrift', 'Firma', '署名', '签名'],
    ['Drop a signature image', 'Solte a imagem da assinatura', 'Suelta la imagen de la firma', 'Déposez l’image de la signature', 'Unterschriftsbild ablegen', 'Trascina l’immagine della firma', '署名画像をドロップ', '拖放签名图片'],
    ['PNG with transparency works best', 'PNG com transparência funciona melhor', 'PNG con transparencia funciona mejor', 'Un PNG transparent donne le meilleur résultat', 'PNG mit Transparenz funktioniert am besten', 'Il PNG con trasparenza funziona meglio', '透過PNGが最適です', '透明背景的 PNG 效果最佳'],
    ['Signature preview', 'Prévia da assinatura', 'Vista previa de la firma', 'Aperçu de la signature', 'Unterschriftsvorschau', 'Anteprima della firma', '署名プレビュー', '签名预览'],
    ['Signature width', 'Largura da assinatura', 'Ancho de la firma', 'Largeur de la signature', 'Unterschriftsbreite', 'Larghezza della firma', '署名の幅', '签名宽度'],
    ['Previous page', 'Página anterior', 'Página anterior', 'Page précédente', 'Vorherige Seite', 'Pagina precedente', '前のページ', '上一页'],
    ['Next page', 'Próxima página', 'Página siguiente', 'Page suivante', 'Nächste Seite', 'Pagina successiva', '次のページ', '下一页'],
    ['Placed signatures', 'Assinaturas posicionadas', 'Firmas colocadas', 'Signatures placées', 'Platzierte Unterschriften', 'Firme posizionate', '配置済みの署名', '已放置的签名'],
    ['None yet — drag the signature onto the page.', 'Nenhuma ainda — arraste a assinatura para a página.', 'Ninguna aún: arrastra la firma a la página.', 'Aucune pour l’instant — faites glisser la signature sur la page.', 'Noch keine — ziehe die Unterschrift auf die Seite.', 'Nessuna per ora — trascina la firma sulla pagina.', 'まだありません — 署名をページにドラッグしてください。', '暂无——请把签名拖到页面上。'],
    ['Upload a PDF to begin', 'Envie um PDF para começar', 'Sube un PDF para empezar', 'Importez un PDF pour commencer', 'Lade ein PDF hoch, um zu beginnen', 'Carica un PDF per iniziare', 'PDFをアップロードして開始', '上传 PDF 开始'],
    ['Download signed PDF', 'Baixar PDF assinado', 'Descargar PDF firmado', 'Télécharger le PDF signé', 'Signiertes PDF herunterladen', 'Scarica il PDF firmato', '署名済みPDFをダウンロード', '下载已签名的 PDF'],
    ['Loaded “{name}” — {n} pages', '“{name}” carregado — {n} páginas', '“{name}” cargado — {n} páginas', '« {name} » chargé — {n} pages', '„{name}“ geladen — {n} Seiten', '“{name}” caricato — {n} pagine', '「{name}」を読み込みました — {n}ページ', '已加载“{name}”——共 {n} 页'],
    ['Loaded “{name}” — {n} page', '“{name}” carregado — {n} página', '“{name}” cargado — {n} página', '« {name} » chargé — {n} page', '„{name}“ geladen — {n} Seite', '“{name}” caricato — {n} pagina', '「{name}」を読み込みました — {n}ページ', '已加载“{name}”——共 {n} 页'],
    ['Could not open that PDF.', 'Não foi possível abrir esse PDF.', 'No se pudo abrir ese PDF.', 'Impossible d’ouvrir ce PDF.', 'Dieses PDF konnte nicht geöffnet werden.', 'Impossibile aprire quel PDF.', 'このPDFを開けませんでした。', '无法打开该 PDF。'],
    ['Signature loaded — drag it into position', 'Assinatura carregada — arraste até a posição', 'Firma cargada: arrástrala a su posición', 'Signature chargée — faites-la glisser à sa place', 'Unterschrift geladen — an die Position ziehen', 'Firma caricata — trascinala nella posizione', '署名を読み込みました — 位置までドラッグしてください', '签名已加载——请拖到合适位置'],
    ['Signed PDF downloaded', 'PDF assinado baixado', 'PDF firmado descargado', 'PDF signé téléchargé', 'Signiertes PDF heruntergeladen', 'PDF firmato scaricato', '署名済みPDFをダウンロードしました', '已下载签名后的 PDF'],
    ['Error: {msg}', 'Erro: {msg}', 'Error: {msg}', 'Erreur : {msg}', 'Fehler: {msg}', 'Errore: {msg}', 'エラー：{msg}', '错误：{msg}'],

    /* ── Image to PDF ── */
    ['Drop images here, or click to browse', 'Solte imagens aqui ou clique para escolher', 'Suelta imágenes aquí o haz clic para elegir', 'Déposez des images ici ou cliquez pour parcourir', 'Bilder hier ablegen oder zum Auswählen klicken', 'Trascina qui le immagini o clicca per sfogliare', '画像をここにドロップ、またはクリックして選択', '拖放图片到此处，或点击选择'],
    ['PNG, JPG or WebP · multiple files allowed', 'PNG, JPG ou WebP · vários arquivos permitidos', 'PNG, JPG o WebP · se permiten varios archivos', 'PNG, JPG ou WebP · plusieurs fichiers possibles', 'PNG, JPG oder WebP · mehrere Dateien erlaubt', 'PNG, JPG o WebP · più file consentiti', 'PNG・JPG・WebP ／ 複数ファイル可', 'PNG、JPG 或 WebP · 可多选'],
    ['No valid image files found.', 'Nenhuma imagem válida encontrada.', 'No se encontraron imágenes válidas.', 'Aucune image valide trouvée.', 'Keine gültigen Bilddateien gefunden.', 'Nessuna immagine valida trovata.', '有効な画像ファイルが見つかりません。', '未找到有效的图片文件。'],
    ['Pages', 'Páginas', 'Páginas', 'Pages', 'Seiten', 'Pagine', 'ページ', '页面'],
    ['Drag to reorder', 'Arraste para reordenar', 'Arrastra para reordenar', 'Glisser pour réorganiser', 'Zum Umordnen ziehen', 'Trascina per riordinare', 'ドラッグで並べ替え', '拖动排序'],
    ['Move up', 'Mover para cima', 'Subir', 'Monter', 'Nach oben', 'Sposta su', '上へ', '上移'],
    ['Move down', 'Mover para baixo', 'Bajar', 'Descendre', 'Nach unten', 'Sposta giù', '下へ', '下移'],
    ['Page size', 'Tamanho da página', 'Tamaño de página', 'Format de page', 'Seitengröße', 'Formato pagina', 'ページサイズ', '页面尺寸'],
    ['Fit to image', 'Ajustar à imagem', 'Ajustar a la imagen', 'Ajuster à l’image', 'An Bild anpassen', 'Adatta all’immagine', '画像に合わせる', '适应图片'],
    ['Letter', 'Carta', 'Carta', 'Lettre US', 'Letter', 'Letter', 'レター', '信纸'],
    ['Orientation', 'Orientação', 'Orientación', 'Orientation', 'Ausrichtung', 'Orientamento', '向き', '方向'],
    ['Auto (per image)', 'Automática (por imagem)', 'Automática (por imagen)', 'Auto (par image)', 'Automatisch (pro Bild)', 'Automatico (per immagine)', '自動（画像ごと）', '自动（按图片）'],
    ['Portrait', 'Retrato', 'Vertical', 'Portrait', 'Hochformat', 'Verticale', '縦', '纵向'],
    ['Landscape', 'Paisagem', 'Horizontal', 'Paysage', 'Querformat', 'Orizzontale', '横', '横向'],
    ['Generate PDF', 'Gerar PDF', 'Generar PDF', 'Générer le PDF', 'PDF erstellen', 'Genera PDF', 'PDFを作成', '生成 PDF'],
    ['Processing image {i} of {n}…', 'Processando imagem {i} de {n}…', 'Procesando imagen {i} de {n}…', 'Traitement de l’image {i} sur {n}…', 'Bild {i} von {n} wird verarbeitet…', 'Elaborazione immagine {i} di {n}…', '画像 {i}/{n} を処理中…', '正在处理第 {i}/{n} 张图片…'],
    ['Saving PDF…', 'Salvando PDF…', 'Guardando PDF…', 'Enregistrement du PDF…', 'PDF wird gespeichert…', 'Salvataggio del PDF…', 'PDFを保存中…', '正在保存 PDF…'],
    ['PDF saved — {n} pages', 'PDF salvo — {n} páginas', 'PDF guardado — {n} páginas', 'PDF enregistré — {n} pages', 'PDF gespeichert — {n} Seiten', 'PDF salvato — {n} pagine', 'PDFを保存しました — {n}ページ', 'PDF 已保存——共 {n} 页'],
    ['PDF saved — {n} page', 'PDF salvo — {n} página', 'PDF guardado — {n} página', 'PDF enregistré — {n} page', 'PDF gespeichert — {n} Seite', 'PDF salvato — {n} pagina', 'PDFを保存しました — {n}ページ', 'PDF 已保存——共 {n} 页'],
    ['Could not decode an image', 'Não foi possível decodificar uma imagem', 'No se pudo decodificar una imagen', 'Impossible de décoder une image', 'Ein Bild konnte nicht dekodiert werden', 'Impossibile decodificare un’immagine', '画像をデコードできませんでした', '无法解码某张图片'],

    /* ── Image Compressor ── */
    ['Settings', 'Configurações', 'Ajustes', 'Réglages', 'Einstellungen', 'Impostazioni', '設定', '设置'],
    ['Mode', 'Modo', 'Modo', 'Mode', 'Modus', 'Modalità', 'モード', '模式'],
    ['Target size', 'Tamanho-alvo', 'Tamaño objetivo', 'Taille cible', 'Zielgröße', 'Dimensione obiettivo', '目標サイズ', '目标大小'],
    ['Quality', 'Qualidade', 'Calidad', 'Qualité', 'Qualität', 'Qualità', '画質', '质量'],
    ['Maximum size (MB)', 'Tamanho máximo (MB)', 'Tamaño máximo (MB)', 'Taille maximale (Mo)', 'Maximale Größe (MB)', 'Dimensione massima (MB)', '最大サイズ（MB）', '最大大小（MB）'],
    ['Maximum dimension', 'Dimensão máxima', 'Dimensión máxima', 'Dimension maximale', 'Maximale Abmessung', 'Dimensione massima', '最大ピクセル数', '最大尺寸'],
    ['Original size', 'Tamanho original', 'Tamaño original', 'Taille d’origine', 'Originalgröße', 'Dimensione originale', '元のサイズ', '原始尺寸'],
    ['Output format', 'Formato de saída', 'Formato de salida', 'Format de sortie', 'Ausgabeformat', 'Formato di output', '出力形式', '输出格式'],
    ['JPEG (most compatible)', 'JPEG (mais compatível)', 'JPEG (más compatible)', 'JPEG (le plus compatible)', 'JPEG (am kompatibelsten)', 'JPEG (più compatibile)', 'JPEG（互換性が高い）', 'JPEG（兼容性最好）'],
    ['WebP (smaller)', 'WebP (menor)', 'WebP (más pequeño)', 'WebP (plus léger)', 'WebP (kleiner)', 'WebP (più leggero)', 'WebP（より小さい）', 'WebP（体积更小）'],
    ['Images', 'Imagens', 'Imágenes', 'Images', 'Bilder', 'Immagini', '画像', '图片'],
    ['Compress', 'Comprimir', 'Comprimir', 'Compresser', 'Komprimieren', 'Comprimi', '圧縮する', '压缩'],
    ['Waiting…', 'Aguardando…', 'En espera…', 'En attente…', 'Wartet…', 'In attesa…', '待機中…', '等待中…'],
    ['Compressing…', 'Comprimindo…', 'Comprimiendo…', 'Compression…', 'Wird komprimiert…', 'Compressione…', '圧縮中…', '压缩中…'],
    ['Could not read this image.', 'Não foi possível ler esta imagem.', 'No se pudo leer esta imagen.', 'Impossible de lire cette image.', 'Dieses Bild konnte nicht gelesen werden.', 'Impossibile leggere questa immagine.', 'この画像を読み込めませんでした。', '无法读取这张图片。'],
    ['Already small enough', 'Já é pequena o bastante', 'Ya es lo bastante pequeña', 'Déjà assez légère', 'Bereits klein genug', 'Già abbastanza piccola', 'すでに十分小さい', '已经足够小'],
    ['Could not reach the target size', 'Não foi possível atingir o tamanho-alvo', 'No se pudo alcanzar el tamaño objetivo', 'Taille cible non atteinte', 'Zielgröße nicht erreichbar', 'Dimensione obiettivo non raggiunta', '目標サイズに届きませんでした', '未能达到目标大小'],
    ['Total: {from} → {to} (saved {saved})', 'Total: {from} → {to} (economia de {saved})', 'Total: {from} → {to} (ahorro de {saved})', 'Total : {from} → {to} ({saved} économisés)', 'Gesamt: {from} → {to} ({saved} gespart)', 'Totale: {from} → {to} (risparmiati {saved})', '合計：{from} → {to}（{saved} 削減）', '合计：{from} → {to}（节省 {saved}）'],
    ['Up to {n} images at a time.', 'Até {n} imagens por vez.', 'Hasta {n} imágenes a la vez.', 'Jusqu’à {n} images à la fois.', 'Bis zu {n} Bilder gleichzeitig.', 'Fino a {n} immagini alla volta.', '一度に最大{n}枚までです。', '一次最多 {n} 张图片。'],
    ['Some images are larger than 80 MB and were skipped.', 'Algumas imagens têm mais de 80 MB e foram ignoradas.', 'Algunas imágenes superan los 80 MB y se omitieron.', 'Certaines images dépassent 80 Mo et ont été ignorées.', 'Einige Bilder sind größer als 80 MB und wurden übersprungen.', 'Alcune immagini superano 80 MB e sono state ignorate.', '80MBを超える画像はスキップしました。', '部分图片超过 80 MB，已跳过。'],

    /* ── Admin login ── */
    ['Welcome back', 'Bem-vindo de volta', 'Bienvenido de nuevo', 'Content de vous revoir', 'Willkommen zurück', 'Bentornato', 'おかえりなさい', '欢迎回来'],
    ['Sign in to manage your tools.', 'Entre para gerenciar suas ferramentas.', 'Inicia sesión para gestionar tus herramientas.', 'Connectez-vous pour gérer vos outils.', 'Melde dich an, um deine Tools zu verwalten.', 'Accedi per gestire i tuoi strumenti.', 'サインインしてツールを管理します。', '登录以管理你的工具。'],
    ['Email', 'E-mail', 'Correo electrónico', 'E-mail', 'E-Mail', 'E-mail', 'メールアドレス', '邮箱'],
    ['Password', 'Senha', 'Contraseña', 'Mot de passe', 'Passwort', 'Password', 'パスワード', '密码'],
    ['Sign in', 'Entrar', 'Iniciar sesión', 'Se connecter', 'Anmelden', 'Accedi', 'サインイン', '登录'],
    ['Verifying…', 'Verificando…', 'Verificando…', 'Vérification…', 'Wird geprüft…', 'Verifica…', '確認中…', '验证中…'],
    ['Invalid email or password.', 'E-mail ou senha inválidos.', 'Correo o contraseña no válidos.', 'E-mail ou mot de passe invalide.', 'Ungültige E-Mail oder ungültiges Passwort.', 'E-mail o password non validi.', 'メールアドレスまたはパスワードが正しくありません。', '邮箱或密码错误。'],
    ['← Back to tools', '← Voltar às ferramentas', '← Volver a las herramientas', '← Retour aux outils', '← Zurück zu den Tools', '← Torna agli strumenti', '← ツール一覧に戻る', '← 返回工具']
  ];

  /* ── Language selection ── */
  const codes = LANGS.map(l => l[0]);
  const stored = () => { try { return localStorage.getItem('xpto-lang'); } catch { return null; } };
  const detect = () => {
    for (const l of navigator.languages || [navigator.language || 'en']) {
      const code = String(l).toLowerCase().split('-')[0];
      if (codes.includes(code)) return code;
    }
    return 'en';
  };
  const lang = codes.includes(stored()) ? stored() : detect();
  const col = codes.indexOf(lang);

  const dict = new Map();
  if (col > 0) ROWS.forEach(r => { if (r[col] && r[col] !== r[0]) dict.set(r[0], r[col]); });

  const X = window.X;
  X.lang = lang;
  X.langs = LANGS;
  X.t = (key, vars) => X.fill(dict.get(key) ?? key, vars);
  X.setLang = code => {
    try { localStorage.setItem('xpto-lang', code); } catch { /* storage unavailable */ }
    location.reload();
  };
  document.documentElement.lang = lang;

  /* ── DOM translation ── */
  const SKIP = 'script, style, textarea, pre, code, svg, [data-no-i18n], .output.has-value > span:first-child, #shortUrl, .token-v, .res-name, .img-name, .file-name, #fileName';
  const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  const written = new WeakMap();

  function textNode(node) {
    const raw = node.nodeValue;
    if (written.get(node) === raw) return;
    const trimmed = raw.trim();
    if (!trimmed) return;
    const tr = dict.get(trimmed);
    if (tr === undefined) return;
    if (node.parentElement && node.parentElement.closest(SKIP)) return;
    const next = raw.replace(trimmed, () => tr);
    written.set(node, next);
    node.nodeValue = next;
  }

  function attrs(el) {
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      if (v && dict.has(v.trim())) el.setAttribute(a, dict.get(v.trim()));
    }
  }

  function walk(root) {
    if (root.nodeType === 3) return textNode(root);
    if (root.nodeType !== 1 || root.closest('[data-no-i18n]')) return;
    attrs(root);
    root.querySelectorAll('[placeholder], [title], [aria-label], [alt]').forEach(attrs);
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) textNode(n);
  }

  function translateTitle() {
    const m = document.title.match(/^(.*) — XPTO Tools$/);
    if (m && dict.has(m[1])) document.title = `${dict.get(m[1])} — XPTO Tools`;
    else if (dict.has(document.title)) document.title = dict.get(document.title);
  }

  function langPicker() {
    const sel = document.createElement('select');
    sel.className = 'select select-sm';
    sel.id = 'lang-select';
    sel.setAttribute('aria-label', X.t('Language'));
    sel.title = X.t('Language');
    sel.style.cssText = 'width:auto; min-width:0';
    sel.innerHTML = LANGS.map(([c, name]) => `<option value="${c}" ${c === lang ? 'selected' : ''}>${name}</option>`).join('');
    sel.addEventListener('change', () => X.setLang(sel.value));
    return sel;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.area === 'admin') return;       // the admin area stays in English
    const actions = document.querySelector('.nav-actions');
    if (actions) actions.prepend(langPicker());
    else if (document.querySelector('#theme')) document.querySelector('#theme').parentElement.prepend(langPicker());
    translateTitle();
    if (col > 0) {
      walk(document.body);
      new MutationObserver(muts => {
        for (const m of muts) {
          if (m.type === 'characterData') textNode(m.target);
          else m.addedNodes.forEach(walk);
        }
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    }
  });
})();
