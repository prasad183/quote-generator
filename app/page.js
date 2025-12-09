"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import InteractiveBackground from "@/app/components/ui/InteractiveBackground";

const gradientPalettes = {
  vibrant: [
    "135deg, #7F00FF 0%, #E100FF 100%",
    "135deg, #00c6ff 0%, #0072ff 100%",
    "135deg, #f6d365 0%, #fda085 100%",
    "135deg, #ff0844 0%, #ffb199 100%",
    "135deg, #a18cd1 0%, #fbc2eb 100%",
    "135deg, #11998e 0%, #38ef7d 100%",
  ],
  twilight: [
    "135deg, #0f2027 0%, #203a43 50%, #2c5364 100%",
    "135deg, #141E30 0%, #243B55 100%",
    "135deg, #1f1c2c 0%, #928dab 100%",
    "135deg, #42275a 0%, #734b6d 100%",
  ],
  sunrise: [
    "135deg, #f8ffae 0%, #43c6ac 100%",
    "135deg, #fddb92 0%, #d1fdff 100%",
    "135deg, #fff1eb 0%, #ace0f9 100%",
    "135deg, #ffd3a5 0%, #fd6585 100%",
  ],
};

const paletteKeys = Object.keys(gradientPalettes);

const defaultQuote = {
  text: "Click the button to get inspired!",
  author: "",
};

function parseQuote(rawQuote) {
  if (!rawQuote) {
    return defaultQuote;
  }

  const [text, author] = rawQuote.split("–").map((part) => part?.trim());
  return {
    text: text ?? rawQuote,
    author: author ?? "Unknown",
  };
}

const formatPaletteLabel = (key) =>
  key.charAt(0).toUpperCase() + key.slice(1).replace("-", " ");

// Translation object
const translations = {
  en: {
    home: "Home",
    search: "Search",
    browse: "Browse",
    submit: "Submit",
    authors: "Authors",
    stats: "Stats",
    favorites: "Favorites",
    settings: "Settings",
    collections: "Collections",
    quoteGenerator: "💡 Quote Generator",
    discoverShare: "Discover, Favo, and share inspiring quotes",
    getQuote: "Get Quote",
    copy: "Copy",
    copied: "Copied!",
    share: "Share",
    favorite: "Favorites",
    filterQuote: "🔍 Filter Quote",
    authorOptional: "Author (optional)",
    categoryOptional: "Category (optional)",
    searchQuotes: "Search Quotes",
    searchPlaceholder: "Enter search query...",
    allFields: "All Fields",
    textOnly: "Text Only",
    authorOnly: "Author Only",
    categoryOnly: "Category Only",
    submitQuote: "Submit Quote",
    quoteText: "Quote Text",
    author: "Author",
    category: "Category",
    browseAll: "Browse All Quotes",
    myCollections: "My Collections",
    createCollection: "Create Collection",
    collectionName: "Collection Name",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    addToCollection: "Add to Collection",
    removeFromCollection: "Remove from Collection",
    noCollections: "No collections yet. Create one to organize your quotes!",
    quotesInCollection: "quotes in this collection",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    language: "Language",
    english: "English",
    spanish: "Spanish",
    french: "French",
    german: "German",
    hindi: "Hindi",
    chinese: "Chinese",
    telugu: "Telugu",
    listen: "Listen",
    stop: "Stop",
    unavailable: "Unavailable",
    clearFilters: "Clear Filters",
    activeFilters: "Active filters",
    fetchingQuote: "Fetching quote...",
    voice: "Voice",
    ready: "Ready",
    notSupported: "Not supported",
    readingComfort: "Reading Comfort",
    fontSize: "Font size",
    enableFocusMode: "Enable focus mode",
    disableFocusMode: "Disable focus mode",
    enterAuthorName: "Enter author name (e.g., Steve Jobs)",
    enterCategory: "Enter category (e.g., motivation)",
    searchQuotesPlaceholder: "Search quotes by text, author, or category...",
    searchPlaceholderText: "Search in text, author, or category (e.g., success)",
    enterQuoteText: "Enter your inspiring quote here...",
    authorNamePlaceholder: "Author name...",
    filterFavoritesPlaceholder: "Filter favorites by keyword or author...",
    clickToGetInspired: "Click the button to get inspired!",
    loggingOut: "Logging out...",
    logout: "Logout",
    noQuotesFound: "No quotes found matching",
    noQuotesFoundRefresh: "No quotes found. Click \"Refresh\" to load quotes.",
    active: "Active",
    manualMode: "Manual mode",
    turnOff: "Turn off",
    startAuto: "Start auto",
    makeSureEntered: "Make sure you entered",
    quoteTextNotAuthor: "quote text (e.g., \"The only way\"), not an author name.",
  },
  es: {
    home: "Inicio",
    search: "Buscar",
    browse: "Explorar",
    submit: "Enviar",
    authors: "Autores",
    stats: "Estadísticas",
    favorites: "Favoritos",
    settings: "Configuración",
    collections: "Colecciones",
    quoteGenerator: "💡 Generador de Citas",
    discoverShare: "Descubre, favoritos y comparte citas inspiradoras",
    getQuote: "Obtener Cita",
    copy: "Copiar",
    copied: "¡Copiado!",
    share: "Compartir",
    favorite: "Favoritos",
    filterQuote: "🔍 Filtrar Cita",
    authorOptional: "Autor (opcional)",
    categoryOptional: "Categoría (opcional)",
    searchQuotes: "Buscar Citas",
    searchPlaceholder: "Ingrese consulta de búsqueda...",
    allFields: "Todos los Campos",
    textOnly: "Solo Texto",
    authorOnly: "Solo Autor",
    categoryOnly: "Solo Categoría",
    submitQuote: "Enviar Cita",
    quoteText: "Texto de la Cita",
    author: "Autor",
    category: "Categoría",
    browseAll: "Explorar Todas las Citas",
    myCollections: "Mis Colecciones",
    createCollection: "Crear Colección",
    collectionName: "Nombre de la Colección",
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    addToCollection: "Agregar a Colección",
    removeFromCollection: "Eliminar de Colección",
    noCollections: "Aún no hay colecciones. ¡Crea una para organizar tus citas!",
    quotesInCollection: "citas en esta colección",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    language: "Idioma",
    english: "Inglés",
    spanish: "Español",
    french: "Francés",
    german: "Alemán",
    hindi: "Hindi",
    chinese: "Chino",
    listen: "Escuchar",
    stop: "Detener",
    unavailable: "No disponible",
    clearFilters: "Limpiar Filtros",
    activeFilters: "Filtros activos",
    fetchingQuote: "Obteniendo cita...",
    voice: "Voz",
    ready: "Listo",
    notSupported: "No compatible",
    readingComfort: "Comodidad de Lectura",
    fontSize: "Tamaño de fuente",
    enableFocusMode: "Activar modo de enfoque",
    disableFocusMode: "Desactivar modo de enfoque",
    enterAuthorName: "Ingrese el nombre del autor (ej., Steve Jobs)",
    enterCategory: "Ingrese la categoría (ej., motivación)",
    searchQuotesPlaceholder: "Buscar citas por texto, autor o categoría...",
    searchPlaceholderText: "Buscar en texto, autor o categoría (ej., éxito)",
    enterQuoteText: "Ingrese su cita inspiradora aquí...",
    authorNamePlaceholder: "Nombre del autor...",
    filterFavoritesPlaceholder: "Filtrar favoritos por palabra clave o autor...",
  },
  fr: {
    home: "Accueil",
    search: "Rechercher",
    browse: "Parcourir",
    submit: "Soumettre",
    authors: "Auteurs",
    stats: "Statistiques",
    favorites: "Favoris",
    settings: "Paramètres",
    collections: "Collections",
    quoteGenerator: "💡 Générateur de Citations",
    discoverShare: "Découvrez, favorisez et partagez des citations inspirantes",
    getQuote: "Obtenir une Citation",
    copy: "Copier",
    copied: "Copié!",
    share: "Partager",
    favorite: "Favoris",
    filterQuote: "🔍 Filtrer la Citation",
    authorOptional: "Auteur (optionnel)",
    categoryOptional: "Catégorie (optionnelle)",
    searchQuotes: "Rechercher des Citations",
    searchPlaceholder: "Entrez votre recherche...",
    allFields: "Tous les Champs",
    textOnly: "Texte Seulement",
    authorOnly: "Auteur Seulement",
    categoryOnly: "Catégorie Seulement",
    submitQuote: "Soumettre une Citation",
    quoteText: "Texte de la Citation",
    author: "Auteur",
    category: "Catégorie",
    browseAll: "Parcourir Toutes les Citations",
    myCollections: "Mes Collections",
    createCollection: "Créer une Collection",
    collectionName: "Nom de la Collection",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    addToCollection: "Ajouter à la Collection",
    removeFromCollection: "Retirer de la Collection",
    noCollections: "Aucune collection pour le moment. Créez-en une pour organiser vos citations!",
    quotesInCollection: "citations dans cette collection",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    language: "Langue",
    english: "Anglais",
    spanish: "Espagnol",
    french: "Français",
    german: "Allemand",
    hindi: "Hindi",
    chinese: "Chinois",
    listen: "Écouter",
    stop: "Arrêter",
    unavailable: "Indisponible",
    clearFilters: "Effacer les Filtres",
    activeFilters: "Filtres actifs",
    fetchingQuote: "Récupération de la citation...",
    voice: "Voix",
    ready: "Prêt",
    notSupported: "Non pris en charge",
    readingComfort: "Confort de Lecture",
    fontSize: "Taille de police",
    enableFocusMode: "Activer le mode focus",
    disableFocusMode: "Désactiver le mode focus",
    enterAuthorName: "Entrez le nom de l'auteur (ex., Steve Jobs)",
    enterCategory: "Entrez la catégorie (ex., motivation)",
    searchQuotesPlaceholder: "Rechercher des citations par texte, auteur ou catégorie...",
    searchPlaceholderText: "Rechercher dans le texte, l'auteur ou la catégorie (ex., succès)",
    enterQuoteText: "Entrez votre citation inspirante ici...",
    authorNamePlaceholder: "Nom de l'auteur...",
    filterFavoritesPlaceholder: "Filtrer les favoris par mot-clé ou auteur...",
  },
  de: {
    home: "Startseite",
    search: "Suchen",
    browse: "Durchsuchen",
    submit: "Einreichen",
    authors: "Autoren",
    stats: "Statistiken",
    favorites: "Favoriten",
    settings: "Einstellungen",
    collections: "Sammlungen",
    quoteGenerator: "💡 Zitat-Generator",
    discoverShare: "Entdecken, Favoriten und teilen Sie inspirierende Zitate",
    getQuote: "Zitat Abrufen",
    copy: "Kopieren",
    copied: "Kopiert!",
    share: "Teilen",
    favorite: "Favoriten",
    filterQuote: "🔍 Zitat Filtern",
    authorOptional: "Autor (optional)",
    categoryOptional: "Kategorie (optional)",
    searchQuotes: "Zitate Suchen",
    searchPlaceholder: "Suchbegriff eingeben...",
    allFields: "Alle Felder",
    textOnly: "Nur Text",
    authorOnly: "Nur Autor",
    categoryOnly: "Nur Kategorie",
    submitQuote: "Zitat Einreichen",
    quoteText: "Zitattext",
    author: "Autor",
    category: "Kategorie",
    browseAll: "Alle Zitate Durchsuchen",
    myCollections: "Meine Sammlungen",
    createCollection: "Sammlung Erstellen",
    collectionName: "Sammlungsname",
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    addToCollection: "Zur Sammlung Hinzufügen",
    removeFromCollection: "Aus Sammlung Entfernen",
    noCollections: "Noch keine Sammlungen. Erstellen Sie eine, um Ihre Zitate zu organisieren!",
    quotesInCollection: "Zitate in dieser Sammlung",
    loading: "Lädt...",
    error: "Fehler",
    success: "Erfolg",
    language: "Sprache",
    english: "Englisch",
    spanish: "Spanisch",
    french: "Französisch",
    german: "Deutsch",
    hindi: "Hindi",
    chinese: "Chinesisch",
    listen: "Anhören",
    stop: "Stoppen",
    unavailable: "Nicht verfügbar",
    clearFilters: "Filter Löschen",
    activeFilters: "Aktive Filter",
    fetchingQuote: "Zitat wird abgerufen...",
    voice: "Stimme",
    ready: "Bereit",
    notSupported: "Nicht unterstützt",
    readingComfort: "Lese-Komfort",
    fontSize: "Schriftgröße",
    enableFocusMode: "Fokus-Modus aktivieren",
    disableFocusMode: "Fokus-Modus deaktivieren",
    enterAuthorName: "Autor-Name eingeben (z.B., Steve Jobs)",
    enterCategory: "Kategorie eingeben (z.B., Motivation)",
    searchQuotesPlaceholder: "Zitate nach Text, Autor oder Kategorie suchen...",
    searchPlaceholderText: "In Text, Autor oder Kategorie suchen (z.B., Erfolg)",
    enterQuoteText: "Geben Sie hier Ihr inspirierendes Zitat ein...",
    authorNamePlaceholder: "Autor-Name...",
    filterFavoritesPlaceholder: "Favoriten nach Stichwort oder Autor filtern...",
  },
  hi: {
    home: "होम",
    search: "खोजें",
    browse: "ब्राउज़ करें",
    submit: "सबमिट करें",
    authors: "लेखक",
    stats: "आंकड़े",
    favorites: "पसंदीदा",
    settings: "सेटिंग्स",
    collections: "संग्रह",
    quoteGenerator: "💡 उद्धरण जनरेटर",
    discoverShare: "प्रेरणादायक उद्धरण खोजें, पसंद करें और साझा करें",
    getQuote: "उद्धरण प्राप्त करें",
    copy: "कॉपी करें",
    copied: "कॉपी किया गया!",
    share: "साझा करें",
    favorite: "पसंदीदा",
    filterQuote: "🔍 उद्धरण फ़िल्टर करें",
    authorOptional: "लेखक (वैकल्पिक)",
    categoryOptional: "श्रेणी (वैकल्पिक)",
    searchQuotes: "उद्धरण खोजें",
    searchPlaceholder: "खोज क्वेरी दर्ज करें...",
    allFields: "सभी फ़ील्ड",
    textOnly: "केवल पाठ",
    authorOnly: "केवल लेखक",
    categoryOnly: "केवल श्रेणी",
    submitQuote: "उद्धरण सबमिट करें",
    quoteText: "उद्धरण पाठ",
    author: "लेखक",
    category: "श्रेणी",
    browseAll: "सभी उद्धरण ब्राउज़ करें",
    myCollections: "मेरे संग्रह",
    createCollection: "संग्रह बनाएं",
    collectionName: "संग्रह का नाम",
    save: "सहेजें",
    cancel: "रद्द करें",
    delete: "हटाएं",
    edit: "संपादित करें",
    addToCollection: "संग्रह में जोड़ें",
    removeFromCollection: "संग्रह से हटाएं",
    noCollections: "अभी तक कोई संग्रह नहीं। अपने उद्धरणों को व्यवस्थित करने के लिए एक बनाएं!",
    quotesInCollection: "इस संग्रह में उद्धरण",
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफलता",
    language: "भाषा",
    english: "अंग्रेजी",
    spanish: "स्पेनिश",
    french: "फ्रेंच",
    german: "जर्मन",
    hindi: "हिंदी",
    chinese: "चीनी",
    listen: "सुनें",
    stop: "रोकें",
    unavailable: "अनुपलब्ध",
    clearFilters: "फ़िल्टर साफ़ करें",
    activeFilters: "सक्रिय फ़िल्टर",
    fetchingQuote: "उद्धरण प्राप्त कर रहे हैं...",
    voice: "आवाज़",
    ready: "तैयार",
    notSupported: "समर्थित नहीं",
    readingComfort: "पढ़ने की सुविधा",
    fontSize: "फ़ॉन्ट आकार",
    enableFocusMode: "फ़ोकस मोड सक्षम करें",
    disableFocusMode: "फ़ोकस मोड अक्षम करें",
    enterAuthorName: "लेखक का नाम दर्ज करें (उदा., Steve Jobs)",
    enterCategory: "श्रेणी दर्ज करें (उदा., प्रेरणा)",
    searchQuotesPlaceholder: "पाठ, लेखक या श्रेणी से उद्धरण खोजें...",
    searchPlaceholderText: "पाठ, लेखक या श्रेणी में खोजें (उदा., सफलता)",
    enterQuoteText: "अपना प्रेरणादायक उद्धरण यहाँ दर्ज करें...",
    authorNamePlaceholder: "लेखक का नाम...",
    filterFavoritesPlaceholder: "कीवर्ड या लेखक से पसंदीदा फ़िल्टर करें...",
  },
  zh: {
    home: "首页",
    search: "搜索",
    browse: "浏览",
    submit: "提交",
    authors: "作者",
    stats: "统计",
    favorites: "收藏",
    settings: "设置",
    collections: "收藏集",
    quoteGenerator: "💡 名言生成器",
    discoverShare: "发现、收藏和分享鼓舞人心的名言",
    getQuote: "获取名言",
    copy: "复制",
    copied: "已复制!",
    share: "分享",
    favorite: "收藏",
    filterQuote: "🔍 过滤名言",
    authorOptional: "作者（可选）",
    categoryOptional: "类别（可选）",
    searchQuotes: "搜索名言",
    searchPlaceholder: "输入搜索查询...",
    allFields: "所有字段",
    textOnly: "仅文本",
    authorOnly: "仅作者",
    categoryOnly: "仅类别",
    submitQuote: "提交名言",
    quoteText: "名言文本",
    author: "作者",
    category: "类别",
    browseAll: "浏览所有名言",
    myCollections: "我的收藏集",
    createCollection: "创建收藏集",
    collectionName: "收藏集名称",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    edit: "编辑",
    addToCollection: "添加到收藏集",
    removeFromCollection: "从收藏集移除",
    noCollections: "还没有收藏集。创建一个来组织您的名言！",
    quotesInCollection: "此收藏集中的名言",
    loading: "加载中...",
    error: "错误",
    success: "成功",
    language: "语言",
    english: "英语",
    spanish: "西班牙语",
    french: "法语",
    german: "德语",
    hindi: "印地语",
    chinese: "中文",
    telugu: "泰卢固语",
    listen: "聆听",
    stop: "停止",
    unavailable: "不可用",
    clearFilters: "清除筛选",
    activeFilters: "活动筛选",
    fetchingQuote: "正在获取名言...",
    voice: "语音",
    ready: "就绪",
    notSupported: "不支持",
    readingComfort: "阅读舒适度",
    fontSize: "字体大小",
    enableFocusMode: "启用专注模式",
    disableFocusMode: "禁用专注模式",
    enterAuthorName: "输入作者姓名（例如，Steve Jobs）",
    enterCategory: "输入类别（例如，动机）",
    searchQuotesPlaceholder: "按文本、作者或类别搜索名言...",
    searchPlaceholderText: "在文本、作者或类别中搜索（例如，成功）",
    enterQuoteText: "在此输入您的励志名言...",
    authorNamePlaceholder: "作者姓名...",
    filterFavoritesPlaceholder: "按关键词或作者筛选收藏...",
  },
  te: {
    home: "హోమ్",
    search: "శోధించు",
    browse: "బ్రౌజ్ చేయి",
    submit: "సమర్పించు",
    authors: "రచయితలు",
    stats: "గణాంకాలు",
    favorites: "ఇష్టమైనవి",
    settings: "సెట్టింగ్‌లు",
    collections: "సేకరణలు",
    quoteGenerator: "💡 కోట్ జెనరేటర్",
    discoverShare: "ప్రేరణాత్మక కోట్‌లను కనుగొని, ఇష్టపడి మరియు భాగస్వామ్యం చేయండి",
    getQuote: "కోట్ పొందండి",
    copy: "కాపీ చేయి",
    copied: "కాపీ చేయబడింది!",
    share: "భాగస్వామ్యం",
    favorite: "ఇష్టమైనవి",
    filterQuote: "🔍 కోట్ ఫిల్టర్ చేయి",
    authorOptional: "రచయిత (ఐచ్ఛికం)",
    categoryOptional: "వర్గం (ఐచ్ఛికం)",
    searchQuotes: "కోట్‌లను శోధించు",
    searchPlaceholder: "శోధన ప్రశ్నను నమోదు చేయండి...",
    allFields: "అన్ని ఫీల్డ్‌లు",
    textOnly: "టెక్స్ట్ మాత్రమే",
    authorOnly: "రచయిత మాత్రమే",
    categoryOnly: "వర్గం మాత్రమే",
    submitQuote: "కోట్ సమర్పించు",
    quoteText: "కోట్ టెక్స్ట్",
    author: "రచయిత",
    category: "వర్గం",
    browseAll: "అన్ని కోట్‌లను బ్రౌజ్ చేయి",
    myCollections: "నా సేకరణలు",
    createCollection: "సేకరణ సృష్టించు",
    collectionName: "సేకరణ పేరు",
    save: "సేవ్ చేయి",
    cancel: "రద్దు చేయి",
    delete: "తొలగించు",
    edit: "సవరించు",
    addToCollection: "సేకరణకు జోడించు",
    removeFromCollection: "సేకరణ నుండి తొలగించు",
    noCollections: "ఇంకా సేకరణలు లేవు. మీ కోట్‌లను నిర్వహించడానికి ఒకదాన్ని సృష్టించండి!",
    quotesInCollection: "ఈ సేకరణలో కోట్‌లు",
    loading: "లోడ్ అవుతోంది...",
    error: "దోషం",
    success: "విజయం",
    language: "భాష",
    english: "ఇంగ్లీష్",
    spanish: "స్పానిష్",
    french: "ఫ్రెంచ్",
    german: "జర్మన్",
    hindi: "హిందీ",
    chinese: "చైనీస్",
    telugu: "తెలుగు",
    listen: "వినండి",
    stop: "ఆపండి",
    unavailable: "అందుబాటులో లేదు",
    clearFilters: "ఫిల్టర్‌లను క్లియర్ చేయి",
    activeFilters: "క్రియాశీల ఫిల్టర్‌లు",
    fetchingQuote: "కోట్ పొందుతోంది...",
    voice: "వాయిస్",
    ready: "సిద్ధంగా ఉంది",
    notSupported: "సమర్థించబడలేదు",
    readingComfort: "పఠన సౌకర్యం",
    fontSize: "ఫాంట్ పరిమాణం",
    enableFocusMode: "ఫోకస్ మోడ్ ప్రారంభించు",
    disableFocusMode: "ఫోకస్ మోడ్ నిలిపివేయి",
    enterAuthorName: "రచయిత పేరు నమోదు చేయండి (ఉదా., Steve Jobs)",
    enterCategory: "వర్గం నమోదు చేయండి (ఉదా., ప్రేరణ)",
    searchQuotesPlaceholder: "టెక్స్ట్, రచయిత లేదా వర్గం ద్వారా కోట్‌లను శోధించు...",
    searchPlaceholderText: "టెక్స్ట్, రచయిత లేదా వర్గంలో శోధించు (ఉదా., విజయం)",
    enterQuoteText: "మీ ప్రేరణాత్మక కోట్‌ను ఇక్కడ నమోదు చేయండి...",
    authorNamePlaceholder: "రచయిత పేరు...",
    filterFavoritesPlaceholder: "కీవర్డ్ లేదా రచయిత ద్వారా ఇష్టమైనవి ఫిల్టర్ చేయి...",
    clickToGetInspired: "ప్రేరణ పొందడానికి బటన్ క్లిక్ చేయండి!",
    loggingOut: "లాగ్ అవుతోంది...",
    logout: "లాగ్ అవుట్",
    noQuotesFound: "కోట్‌లు కనుగొనబడలేదు",
    noQuotesFoundRefresh: "కోట్‌లు కనుగొనబడలేదు. కోట్‌లను లోడ్ చేయడానికి \"Refresh\" క్లిక్ చేయండి.",
    active: "క్రియాశీలం",
    manualMode: "మాన్యువల్ మోడ్",
    turnOff: "ఆపు",
    startAuto: "ఆటో ప్రారంభించు",
    makeSureEntered: "మీరు నమోదు చేసినది నిర్ధారించుకోండి",
    quoteTextNotAuthor: "కోట్ టెక్స్ట్ (ఉదా., \"The only way\"), రచయిత పేరు కాదు.",
  },
};

// Get translation function
const t = (key, lang = "en") => translations[lang]?.[key] || translations.en[key] || key;

// Translate quote text using backend API endpoint
const translateQuote = async (text, targetLang) => {
  if (targetLang === "en" || !text) return text;
  
  try {
    // Using local API endpoint for translation
    const response = await fetch("/api/language/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        targetLang: targetLang,
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.translatedText) {
      return data.translatedText;
    }
    
    // Fallback to original text if translation fails
    return text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
};

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");
  const [paletteKey, setPaletteKey] = useState("vibrant");
  const [backgroundIndex, setBackgroundIndex] = useState(() =>
    Math.floor(Math.random() * gradientPalettes.vibrant.length),
  );
  const [isThemeFixed, setIsThemeFixed] = useState(false);
  const [themeMode, setThemeMode] = useState("dark"); // "dark" or "light"
  const [quote, setQuote] = useState(defaultQuote);
  const [originalQuote, setOriginalQuote] = useState(defaultQuote);
  const [translatedQuote, setTranslatedQuote] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [copied, setCopied] = useState(false);
  const [fetchCount, setFetchCount] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlaySeconds, setAutoPlaySeconds] = useState(20);
  const [countdown, setCountdown] = useState(20);
  const [fontSize, setFontSize] = useState(22);
  const [readingMode, setReadingMode] = useState(false);
  const [favoriteQuery, setFavoriteQuery] = useState("");
  const [speechSupport, setSpeechSupport] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechUtteranceRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchField, setSearchField] = useState("all");
  const [searchPage, setSearchPage] = useState(1);
  const [searchPagination, setSearchPagination] = useState(null);
  const [newQuoteText, setNewQuoteText] = useState("");
  const [newQuoteAuthor, setNewQuoteAuthor] = useState("");
  const [newQuoteCategory, setNewQuoteCategory] = useState("general");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [authorsLoading, setAuthorsLoading] = useState(false);
  const [authorsError, setAuthorsError] = useState(null);
  const [showAuthors, setShowAuthors] = useState(false);
  const [authorsStats, setAuthorsStats] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [allQuotes, setAllQuotes] = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesPage, setQuotesPage] = useState(1);
  const [quotesPagination, setQuotesPagination] = useState(null);
  const [quotesFilterAuthor, setQuotesFilterAuthor] = useState("");
  const [quotesFilterCategory, setQuotesFilterCategory] = useState("");
  const [quotesFilterSearch, setQuotesFilterSearch] = useState("");
  const [quotesFilters, setQuotesFilters] = useState({});
  const [quoteFilterAuthor, setQuoteFilterAuthor] = useState("");
  const [quoteFilterCategory, setQuoteFilterCategory] = useState("");
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [editingCollection, setEditingCollection] = useState(null);
  const [language, setLanguage] = useState("en");
  const [availableLanguages, setAvailableLanguages] = useState([
    { code: "en", name: "English", nativeName: "English" },
    { code: "es", name: "Spanish", nativeName: "Español" },
    { code: "fr", name: "French", nativeName: "Français" },
    { code: "de", name: "German", nativeName: "Deutsch" },
    { code: "hi", name: "Hindi", nativeName: "हिंदी" },
    { code: "zh", name: "Chinese", nativeName: "中文" },
    { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  ]);
  const [languagesLoading, setLanguagesLoading] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include", // Ensure cookies are sent
        });
        if (response.ok) {
          const data = await response.json();
          // Handle response: { user: { id, name, username } }
          if (data.user) {
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            // Unexpected response format
            console.warn("Unexpected response format from /api/auth/me:", data);
            router.push("/login");
          }
        } else {
          // Not authenticated, redirect to login
          const errorData = await response.json().catch(() => ({}));
          console.log("Authentication check failed:", errorData.error || "Not authenticated");
          router.push("/login");
        }
      } catch (err) {
        router.push("/login");
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  // Handle logout
  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      setLogoutMessage("");
      
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Ensure cookies are sent
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful logout response: { message: "Logout successful" }
        if (data.message) {
          setLogoutMessage(data.message);
          // Clear user state
          setUser(null);
          setIsAuthenticated(false);
          // Show success message briefly before redirecting
          setTimeout(() => {
            router.push("/login");
            router.refresh();
          }, 1000);
        } else {
          // Unexpected response format, still logout
          setUser(null);
          setIsAuthenticated(false);
          router.push("/login");
          router.refresh();
        }
      } else {
        // Handle error response
        setLogoutMessage(data.error || "Logout failed. Please try again.");
        setTimeout(() => {
          setLogoutMessage("");
        }, 3000);
      }
    } catch (err) {
      console.error("Logout error:", err);
      setLogoutMessage("Something went wrong during logout. Please try again.");
      setTimeout(() => {
        setLogoutMessage("");
      }, 3000);
    } finally {
      setLogoutLoading(false);
    }
  };

  // Fetch collections from API
  const fetchCollections = useCallback(async () => {
    try {
      const response = await fetch("/api/collections");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.collections) {
          setCollections(data.collections);
        }
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
      // Fallback to localStorage if API fails
      try {
        const storedCollections = window.localStorage.getItem("quote-collections");
        if (storedCollections) {
          const parsed = JSON.parse(storedCollections);
          if (Array.isArray(parsed)) {
            setCollections(parsed);
          }
        }
      } catch {
        // ignore collections retrieval errors
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isAuthenticated) {
      return;
    }

    try {
      const storedPalette = window.localStorage.getItem("quote-palette");
      if (storedPalette && storedPalette in gradientPalettes) {
        setPaletteKey(storedPalette);
        setBackgroundIndex(
          Math.floor(Math.random() * gradientPalettes[storedPalette].length),
        );
      }
      const storedThemeFixed = window.localStorage.getItem("quote-theme-fixed");
      if (storedThemeFixed === "true") {
        setIsThemeFixed(true);
      }
      const storedThemeMode = window.localStorage.getItem("quote-theme-mode");
      if (storedThemeMode === "light" || storedThemeMode === "dark") {
        setThemeMode(storedThemeMode);
      }
    } catch {
      // ignore palette retrieval errors
    }

    try {
      const storedFavorites = window.localStorage.getItem("quote-favorites");
      if (storedFavorites) {
        const parsed = JSON.parse(storedFavorites);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch {
      // ignore favorites retrieval errors
    }

    try {
      const storedFontSize = window.localStorage.getItem("quote-font-size");
      if (storedFontSize) {
        const parsed = Number(storedFontSize);
        if (!Number.isNaN(parsed) && parsed >= 16 && parsed <= 38) {
          setFontSize(parsed);
        }
      }
      const storedReadingMode = window.localStorage.getItem(
        "quote-reading-mode",
      );
      if (storedReadingMode) {
        setReadingMode(storedReadingMode === "true");
      }
    } catch {
      // ignore preference retrieval errors
    }

    // Fetch collections on mount
    fetchCollections();

    try {
      const storedLanguage = window.localStorage.getItem("quote-language");
      if (storedLanguage && translations[storedLanguage]) {
        setLanguage(storedLanguage);
      }
    } catch {
      // ignore language retrieval errors
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem("quote-palette", paletteKey);
    } catch {
      // ignore write failures
    }
  }, [paletteKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem("quote-theme-fixed", String(isThemeFixed));
    } catch {
      // ignore write failures
    }
  }, [isThemeFixed]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(
        "quote-favorites",
        JSON.stringify(favorites.slice(0, 10)),
      );
    } catch {
      // ignore write failures
    }
  }, [favorites]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem("quote-font-size", String(fontSize));
      window.localStorage.setItem("quote-reading-mode", String(readingMode));
    } catch {
      // ignore write failures
    }
  }, [fontSize, readingMode]);

  useEffect(() => {
    setCountdown(autoPlaySeconds);
  }, [autoPlaySeconds]);

  // Save collections to localStorage as backup (API is primary source)
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem("quote-collections", JSON.stringify(collections));
    } catch {
      // ignore write failures
    }
  }, [collections]);

  // Fetch available languages from API
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLanguagesLoading(true);
        const response = await fetch("/api/language/languages");
        
        if (!response.ok) {
          throw new Error(`Languages API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.languages && Array.isArray(data.languages)) {
          setAvailableLanguages(data.languages);
        }
      } catch (error) {
        console.error("Error fetching languages:", error);
        // Keep default languages on error
      } finally {
        setLanguagesLoading(false);
      }
    };

    if (typeof window !== "undefined") {
      fetchLanguages();
    }
  }, []);

  // Save language to localStorage
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      window.localStorage.setItem("quote-language", language);
    } catch {
      // ignore write failures
    }
  }, [language]);

  // Translate quote when language changes
  useEffect(() => {
    const translateCurrentQuote = async () => {
      if (language === "en" || !originalQuote.text || originalQuote.text === defaultQuote.text) {
        setTranslatedQuote(null);
        setQuote(originalQuote);
        return;
      }

      setTranslating(true);
      try {
        const translatedText = await translateQuote(originalQuote.text, language);
        const translatedAuthor = originalQuote.author 
          ? await translateQuote(originalQuote.author, language)
          : null;
        
        setTranslatedQuote({
          text: translatedText,
          author: translatedAuthor,
        });
        setQuote({
          text: translatedText,
          author: translatedAuthor,
        });
      } catch (error) {
        console.error("Failed to translate quote:", error);
        setQuote(originalQuote);
      } finally {
        setTranslating(false);
      }
    };

    translateCurrentQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, originalQuote.text, originalQuote.author]);

  // Close collection dropdown when clicking outside
  useEffect(() => {
    if (!showCollectionDropdown) return;
    
    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-collection-dropdown]')) {
        setShowCollectionDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCollectionDropdown]);

  const currentGradient = useMemo(() => {
    const palette = gradientPalettes[paletteKey];
    return palette[backgroundIndex % palette.length];
  }, [backgroundIndex, paletteKey]);

  // Apply gradient to body background
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const body = document.body;
    if (!body) return;

    const gradient = `linear-gradient(${currentGradient})`;
    body.style.background = gradient;
    body.style.backgroundSize = "400% 400%";
    body.style.animation = "gradientShift 20s ease infinite";

    // Cleanup function to restore original if needed
    return () => {
      // Optionally restore default on unmount
    };
  }, [currentGradient]);

  const changeBackground = useCallback(() => {
    // Don't change background if theme is fixed
    if (isThemeFixed) {
      return;
    }

    const palette = gradientPalettes[paletteKey];

    if (palette.length <= 1) {
      return;
    }

    setBackgroundIndex((prev) => {
      let next = Math.floor(Math.random() * palette.length);
      if (next === prev) {
        next = (next + 1) % palette.length;
      }
      return next;
    });
  }, [paletteKey, isThemeFixed]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hasSpeech =
      "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    setSpeechSupport(hasSpeech);

    return () => {
      if (hasSpeech) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getQuote = useCallback(
    async (isInitialLoad = false, author = null, category = null) => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams();
        if (author && author.trim()) {
          params.append("author", author.trim());
        }
        if (category && category.trim()) {
          params.append("category", category.trim());
        }

        const url = params.toString() 
          ? `/api/quote?${params.toString()}`
          : "/api/quote";

        const response = await fetch(url, { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Unable to fetch a new quote right now.");
        }

        const data = await response.json();
        
        // Handle new response structure: { quote: "...", data: { id, text, author, category } }
        // Prefer structured data if available, fallback to parsing quote string
        let nextQuote;
        if (data.data && data.data.text && data.data.author) {
          // Use structured data from API response
          nextQuote = {
            text: data.data.text,
            author: data.data.author,
          };
        } else if (data.quote) {
          // Fallback to parsing quote string (legacy format)
          nextQuote = parseQuote(data.quote);
        } else {
          // If neither format is available, use default
          nextQuote = defaultQuote;
        }

        setQuote((prevQuote) => {
          if (!isInitialLoad && prevQuote.text !== defaultQuote.text) {
            setHistory((prevHistory) => {
              // Check if this quote already exists in history (by text and author)
              const quoteExists = prevHistory.some(
                (item) => item.text === prevQuote.text && item.author === prevQuote.author
              );
              
              // Only add if it doesn't already exist
              if (!quoteExists) {
                const updated = [
                  {
                    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                    ...prevQuote,
                  },
                  ...prevHistory,
                ];
                return updated.slice(0, 6);
              }
              
              // If it exists, return history unchanged
              return prevHistory;
            });
          }

          return nextQuote;
        });

        // Store original quote for translation
        setOriginalQuote(nextQuote);

        if (!isInitialLoad) {
          setFetchCount((count) => count + 1);
          if (autoPlay) {
            setCountdown(autoPlaySeconds);
          }
        }

        setCopied(false);
        if (speechSupport && typeof window !== "undefined") {
          window.speechSynthesis.cancel();
          speechUtteranceRef.current = null;
          setIsSpeaking(false);
        }
        changeBackground();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while fetching the quote.",
        );
      } finally {
        setLoading(false);
      }
    },
    [autoPlay, autoPlaySeconds, changeBackground, speechSupport],
  );

  useEffect(() => {
    if (isAuthenticated) {
      void getQuote(true);
    }
  }, [getQuote, isAuthenticated]);

  useEffect(() => {
    if (!autoPlay || !isMounted) {
      return;
    }

    setCountdown(autoPlaySeconds);

    const intervalId = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          void getQuote();
          return autoPlaySeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [autoPlay, autoPlaySeconds, getQuote, isMounted]);

  const copyQuote = useCallback(async () => {
    if (!navigator?.clipboard) {
      setError("Clipboard is not available in this browser.");
      return;
    }

    try {
      await navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not copy the quote. Please try again.",
      );
    }
  }, [quote]);

  const shareQuote = useCallback(async () => {
    if (!navigator?.share) {
      await copyQuote();
      return;
    }

    try {
      await navigator.share({
        title: "Inspiring Quote",
        text: `"${quote.text}" — ${quote.author}`,
      });
    } catch {
      // Ignore share cancellation silently
    }
  }, [copyQuote, quote]);

  const stopSpeaking = useCallback(() => {
    if (!speechSupport || typeof window === "undefined") {
      return;
    }

    window.speechSynthesis.cancel();
    speechUtteranceRef.current = null;
    setIsSpeaking(false);
  }, [speechSupport]);

  const speakQuote = useCallback(() => {
    if (!speechSupport || typeof window === "undefined" || !quote.text) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const Utterance =
        window.SpeechSynthesisUtterance ??
        (typeof SpeechSynthesisUtterance !== "undefined"
          ? SpeechSynthesisUtterance
          : null);
      if (!Utterance) {
        setSpeechSupport(false);
        return;
      }
      const utterance = new Utterance(
        quote.author
          ? `${quote.text}. ${quote.author}`
          : quote.text,
      );
      utterance.onend = () => {
        setIsSpeaking(false);
        speechUtteranceRef.current = null;
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        speechUtteranceRef.current = null;
      };
      speechUtteranceRef.current = utterance;
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      setIsSpeaking(false);
      speechUtteranceRef.current = null;
      setError(
        err instanceof Error
          ? err.message
          : "Unable to play the quote using text-to-speech.",
      );
    }
  }, [quote.author, quote.text, speechSupport]);

  const addFavorite = useCallback(() => {
    const isDefault = quote.text === defaultQuote.text;
    if (isDefault) {
      return;
    }

    setFavorites((prev) => {
      const alreadySaved = prev.some(
        (fav) => fav.text === quote.text && fav.author === quote.author,
      );
      if (alreadySaved) {
        return prev;
      }

      const nextFavorites = [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          ...quote,
        },
        ...prev,
      ];

      return nextFavorites.slice(0, 10);
    });
  }, [quote]);

  const removeFavorite = useCallback((id) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
  }, []);

  const restoreQuote = useCallback(
    (entry) => {
      stopSpeaking();
      setOriginalQuote(entry);
      setQuote(entry);
    },
    [stopSpeaking],
  );

  const toggleAutoPlay = useCallback(() => {
    setAutoPlay((prev) => {
      if (prev) {
        setCountdown(autoPlaySeconds);
      }
      return !prev;
    });
  }, [autoPlaySeconds]);

  const cyclePalette = useCallback(() => {
    const currentIndex = paletteKeys.indexOf(paletteKey);
    const nextKey = paletteKeys[(currentIndex + 1) % paletteKeys.length];
    setPaletteKey(nextKey);
    // Reset background index to show a new gradient from the new palette
    setBackgroundIndex(0);
  }, [paletteKey]);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      const newMode = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem("quote-theme-mode", newMode);
      return newMode;
    });
  }, []);

  const toggleThemeFixed = useCallback(() => {
    setIsThemeFixed((prev) => !prev);
  }, []);

  const searchQuotes = useCallback(
    async (query, field = "all", page = 1) => {
      if (!query || query.trim().length === 0) {
        setSearchResults([]);
        setSearchError(null);
        return;
      }

      try {
        setSearchLoading(true);
        setSearchError(null);

        const params = new URLSearchParams({
          q: query.trim(),
          field,
          page: page.toString(),
          limit: "10",
        });

        const response = await fetch(`/api/quotes/search?${params}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to search quotes right now.");
        }

        const data = await response.json();
        setSearchResults(data.results || []);
        setSearchPagination(data.pagination || null);
        setSearchPage(page);
      } catch (err) {
        setSearchError(
          err instanceof Error
            ? err.message
            : "Something went wrong while searching quotes.",
        );
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [],
  );

  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery.length > 0) {
        setShowSearch(true);
        setSearchError(null);
        // Perform search with the selected field
        void searchQuotes(trimmedQuery, searchField, 1);
      } else {
        setSearchError("Please enter a search query");
        setSearchResults([]);
        setShowSearch(false);
      }
    },
    [searchQuery, searchField, searchQuotes],
  );

  const handleSearchResultClick = useCallback(
    (result) => {
      stopSpeaking();
      const newQuote = {
        text: result.text,
        author: result.author,
      };
      setOriginalQuote(newQuote);
      setQuote(newQuote);
      setShowSearch(false);
    },
    [stopSpeaking],
  );

  const submitNewQuote = useCallback(
    async (e) => {
      e.preventDefault();

      // Reset states
      setSubmitError(null);
      setSubmitSuccess(false);

      // Validation
      if (!newQuoteText.trim()) {
        setSubmitError("Quote text is required");
        return;
      }

      if (newQuoteText.trim().length > 500) {
        setSubmitError("Quote text must be 500 characters or less");
        return;
      }

      if (!newQuoteAuthor.trim()) {
        setSubmitError("Author is required");
        return;
      }

      if (newQuoteAuthor.trim().length > 100) {
        setSubmitError("Author name must be 100 characters or less");
        return;
      }

      try {
        setSubmitLoading(true);

        const response = await fetch("/api/quotes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: newQuoteText.trim(),
            author: newQuoteAuthor.trim(),
            category: newQuoteCategory,
          }),
        });

        if (!response.ok) {
          let errorMessage = "Unable to submit quote right now.";
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // If response is not JSON, use default message
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        
        // Handle response structure: { id, text, author, category, createdAt }
        if (data.id && data.text && data.author) {
          setSubmittedQuote(data);
          setSubmitSuccess(true);
          
          // Clear form
          setNewQuoteText("");
          setNewQuoteAuthor("");
          setNewQuoteCategory("general");
          
          // Load the new quote after showing success message
          setTimeout(() => {
            const newQuote = {
              text: data.text,
              author: data.author,
            };
            setOriginalQuote(newQuote);
            setQuote(newQuote);
            setSubmitSuccess(false);
            setSubmittedQuote(null);
            // Switch to home tab to view the quote
            setActiveTab("home");
          }, 2000);
        } else {
          throw new Error("Unexpected response format from server");
        }
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : "Something went wrong while submitting the quote.",
        );
      } finally {
        setSubmitLoading(false);
      }
    },
    [newQuoteText, newQuoteAuthor, newQuoteCategory],
  );

  const fetchAuthors = useCallback(async () => {
    try {
      setAuthorsLoading(true);
      setAuthorsError(null);

      const response = await fetch("/api/authors", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to fetch authors right now.");
      }

      const data = await response.json();
      
      // Handle response structure: { authors: [], total: 12, totalQuotes: 15 }
      if (data.authors && Array.isArray(data.authors)) {
        setAuthors(data.authors);
      } else {
        setAuthors([]);
      }
      
      // Store stats: { total: 12, totalQuotes: 15 }
      if (data.total !== undefined && data.totalQuotes !== undefined) {
        setAuthorsStats({
          total: data.total,
          totalQuotes: data.totalQuotes,
        });
      } else {
        setAuthorsStats(null);
      }
      
      setShowAuthors(true);
    } catch (err) {
      setAuthorsError(
        err instanceof Error
          ? err.message
          : "Something went wrong while fetching authors.",
      );
    } finally {
      setAuthorsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);

      const response = await fetch("/api/stats", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to fetch statistics right now.");
      }

      const data = await response.json();
      setStats(data);
      setShowStats(true);
    } catch (err) {
      setStatsError(
        err instanceof Error
          ? err.message
          : "Something went wrong while fetching statistics.",
      );
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Collection management functions
  const createCollection = useCallback(async (name) => {
    if (!name || !name.trim()) {
      return;
    }
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        const newCollection = await response.json();
        // Refetch all collections to ensure consistency
        const fetchResponse = await fetch("/api/collections");
        if (fetchResponse.ok) {
          const fetchData = await fetchResponse.json();
          if (fetchData.success && fetchData.collections) {
            setCollections(fetchData.collections);
          } else if (newCollection && newCollection.id) {
            // Fallback: add the new collection if fetch fails
            setCollections((prev) => [...prev, newCollection]);
          }
        } else if (newCollection && newCollection.id) {
          // Fallback: add the new collection if fetch fails
          setCollections((prev) => [...prev, newCollection]);
        }
        setCollectionName("");
        setShowCollectionModal(false);
      } else {
        // Try to parse error response as JSON, fallback to text
        let errorMessage = "Failed to create collection";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error("Error creating collection:", errorData);
        } catch (parseError) {
          // If JSON parsing fails, try to get text
          try {
            const errorText = await response.text();
            console.error("Error creating collection (text):", errorText);
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.error("Error creating collection (status):", response.status, response.statusText);
            errorMessage = `Failed to create collection: ${response.status} ${response.statusText}`;
          }
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error creating collection (catch):", error);
      console.error("Error details:", {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      });
      alert(error?.message || "Failed to create collection. Please check the console for details.");
    }
  }, []);

  const deleteCollection = useCallback(async (id) => {
    // Find collection name by id
    const collection = collections.find((col) => col.id === id);
    if (!collection) return;

    try {
      const response = await fetch(`/api/collections?name=${encodeURIComponent(collection.name)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCollections((prev) => prev.filter((col) => col.id !== id));
        if (selectedCollection === id) {
          setSelectedCollection(null);
        }
      } else {
        const error = await response.json();
        console.error("Error deleting collection:", error);
        alert(error.error || "Failed to delete collection");
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
      alert("Failed to delete collection");
    }
  }, [collections, selectedCollection]);

  const editCollection = useCallback(async (id, newName) => {
    if (!newName || !newName.trim()) {
      return;
    }
    // Find collection name by id
    const collection = collections.find((col) => col.id === id);
    if (!collection) return;

    try {
      const response = await fetch(`/api/collections?name=${encodeURIComponent(collection.name)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setCollections((prev) =>
          prev.map((col) =>
            col.id === id ? data.collection : col
          )
        );
        setEditingCollection(null);
        setCollectionName("");
      } else {
        const error = await response.json();
        console.error("Error updating collection:", error);
        alert(error.error || "Failed to update collection");
      }
    } catch (error) {
      console.error("Error updating collection:", error);
      alert("Failed to update collection");
    }
  }, [collections]);

  const addQuoteToCollection = useCallback(async (collectionId, quote) => {
    // Find collection name by id
    const collection = collections.find((col) => col.id === collectionId);
    if (!collection) return;

    try {
      const response = await fetch(`/api/collections/quotes?name=${encodeURIComponent(collection.name)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: quote.text,
          author: quote.author,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCollections((prev) =>
          prev.map((col) =>
            col.id === collectionId ? data.collection : col
          )
        );
      } else {
        const error = await response.json();
        console.error("Error adding quote to collection:", error);
        alert(error.error || "Failed to add quote to collection");
      }
    } catch (error) {
      console.error("Error adding quote to collection:", error);
      alert("Failed to add quote to collection");
    }
  }, [collections]);

  const removeQuoteFromCollection = useCallback(async (collectionId, quote) => {
    // Find collection name by id
    const collection = collections.find((col) => col.id === collectionId);
    if (!collection) {
      console.error("Collection not found with id:", collectionId);
      return;
    }

    // Handle both quote object and quote ID for backward compatibility
    let quoteToRemove;
    if (typeof quote === 'object' && quote.text && quote.author) {
      // Quote object is passed directly
      quoteToRemove = quote;
    } else if (typeof quote === 'string') {
      // Quote ID is passed - find the quote in the collection
      quoteToRemove = collection.quotes.find((q) => q.id === quote);
      if (!quoteToRemove) {
        console.error("Quote not found in collection with id:", quote);
        return;
      }
    } else {
      console.error("Invalid quote parameter. Expected quote object with text and author, or quote ID.");
      return;
    }

    if (!quoteToRemove.text || !quoteToRemove.author) {
      console.error("Quote must have text and author properties");
      return;
    }

    try {
      const url = `/api/collections/quotes?name=${encodeURIComponent(collection.name)}`;
      console.log("Deleting quote from collection:", url, quoteToRemove);
      
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: quoteToRemove.text,
          author: quoteToRemove.author,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update collections state with the updated collection from response
        setCollections((prev) =>
          prev.map((col) =>
            col.id === collectionId ? data.collection : col
          )
        );
      } else {
        const error = await response.json();
        console.error("Error removing quote from collection:", error);
        alert(error.error || "Failed to remove quote from collection");
      }
    } catch (error) {
      console.error("Error removing quote from collection:", error);
      alert("Failed to remove quote from collection");
    }
  }, [collections]);

  const fetchAllQuotes = useCallback(async (page = 1, limit = 10, author = null, category = null, search = null) => {
    try {
      setQuotesLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Add search parameter if provided (searches across all fields)
      if (search && search.trim()) {
        params.append("search", search.trim());
      }

      // Add author filter if provided
      if (author && author.trim()) {
        params.append("author", author.trim());
      }

      // Add category filter if provided
      if (category && category.trim()) {
        params.append("category", category.trim());
      }

      const response = await fetch(`/api/quotes?${params}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to fetch quotes right now.");
      }

      const data = await response.json();
      // Handle response structure: { quotes: [], pagination: {}, filters: {} }
      if (data.quotes && Array.isArray(data.quotes)) {
        setAllQuotes(data.quotes);
      } else {
        setAllQuotes([]);
      }
      
      // Handle pagination: { page, limit, total, totalPages, hasNextPage, hasPreviousPage }
      if (data.pagination) {
        setQuotesPagination(data.pagination);
      } else {
        setQuotesPagination(null);
      }
      
      // Handle filters: { search: "success", author: "Steve Jobs", category: "motivation" } or {}
      if (data.filters) {
        setQuotesFilters(data.filters);
      } else {
        setQuotesFilters({});
      }
      
      setQuotesPage(page);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while fetching quotes.",
      );
      setAllQuotes([]);
      setQuotesPagination(null);
      setQuotesFilters({});
    } finally {
      setQuotesLoading(false);
    }
  }, []);

  const nextPaletteLabel = useMemo(() => {
    const currentIndex = paletteKeys.indexOf(paletteKey);
    const nextKey = paletteKeys[(currentIndex + 1) % paletteKeys.length];
    return formatPaletteLabel(nextKey);
  }, [paletteKey]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const handler = (event) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        void getQuote();
        return;
      }

      if (key === "f") {
        event.preventDefault();
        addFavorite();
        return;
      }

      if (key === "s" && speechSupport) {
        event.preventDefault();
        if (isSpeaking) {
          stopSpeaking();
        } else {
          speakQuote();
        }
        return;
      }

      if (key === "c") {
        event.preventDefault();
        void copyQuote();
        return;
      }

      if (key === "p") {
        event.preventDefault();
        toggleAutoPlay();
        return;
      }

      if (key === "escape") {
        stopSpeaking();
        if (showSearch) {
          setShowSearch(false);
          setSearchQuery("");
          setSearchResults([]);
        }
      }

      if (key === "/" && !showSearch) {
        event.preventDefault();
        const searchInput = document.querySelector('input[type="text"][placeholder*="Search quotes"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    addFavorite,
    copyQuote,
    getQuote,
    isMounted,
    isSpeaking,
    showSearch,
    speakQuote,
    speechSupport,
    stopSpeaking,
    toggleAutoPlay,
  ]);

  const infoBarStyles = {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  };

  const infoPillStyles = {
    padding: "10px 16px",
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.05)",
    border: "1px solid rgba(148, 163, 184, 0.3)",
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const controlsGridStyles = {
    display: "grid",
    gap: 18,
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  };

  const controlCardStyles = {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "2px solid rgba(99, 102, 241, 0.2)",
    borderRadius: 20,
    padding: "18px 20px",
    boxShadow: "0 16px 32px rgba(15, 23, 42, 0.15)",
    textAlign: "left",
  };

  const buttonStyles = useMemo(() => ({
    base: {
      padding: "16px 28px",
      border: "none",
      fontSize: 16,
      borderRadius: 20,
      cursor: "pointer",
      transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      minWidth: 180,
      width: "auto",
      minHeight: 56,
      position: "relative",
      overflow: "hidden",
      touchAction: "manipulation",
      fontFamily: "'Poppins', sans-serif",
      letterSpacing: "0.5px",
      textTransform: "none",
    },
    primary: {
      background: "linear-gradient(135deg, #4c5fd8 0%, #5a3d8f 30%, #b872d8 60%, #3a7bc8 100%)",
      backgroundSize: "300% 300%",
      color: "white",
      boxShadow: "0 20px 60px rgba(76, 95, 216, 0.4), 0 8px 24px rgba(90, 61, 143, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
      animation: "gradientShift 8s ease infinite",
      border: "1px solid rgba(255, 255, 255, 0.15)",
    },
      secondary: {
        background: themeMode === "dark" 
          ? "linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.2) 100%)" 
          : "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)",
        color: themeMode === "dark" ? "#e2e8f0" : "#0f172a",
        border: themeMode === "dark" 
          ? "2px solid rgba(99, 102, 241, 0.4)" 
          : "2px solid rgba(99, 102, 241, 0.3)",
        boxShadow: themeMode === "dark"
          ? "0 12px 32px rgba(99, 102, 241, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 4px 16px rgba(0, 0, 0, 0.2)"
          : "0 12px 32px rgba(99, 102, 241, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.5) inset, 0 4px 16px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(24px) saturate(200%)",
        WebkitBackdropFilter: "blur(24px) saturate(200%)",
      },
      outline: {
        background: themeMode === "dark" 
          ? "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)" 
          : "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%)",
        color: themeMode === "dark" ? "#cbd5e1" : "#475569",
        border: themeMode === "dark" 
          ? "2px solid rgba(99, 102, 241, 0.4)" 
          : "2px solid rgba(99, 102, 241, 0.3)",
        boxShadow: themeMode === "dark"
          ? "0 8px 24px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
          : "0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",

      },
  }), [themeMode]);

  const paletteFriendlyName = formatPaletteLabel(paletteKey);
  const isDefaultQuote = quote.text === defaultQuote.text;
  const isFavorite = favorites.some(
    (fav) => fav.text === quote.text && fav.author === quote.author,
  );
  const autoPlayProgress =
    autoPlay && autoPlaySeconds
      ? Math.min(
          100,
          Math.max(0, ((autoPlaySeconds - countdown) / autoPlaySeconds) * 100),
        )
      : 0;

  const visibleFavorites = useMemo(() => {
    const query = favoriteQuery.trim().toLowerCase();
    if (!query) {
      return favorites;
    }
      
    return favorites.filter((fav) =>
      `${fav.text} ${fav.author}`.toLowerCase().includes(query),
    );
  }, [favoriteQuery, favorites]);

  const favoriteStats = useMemo(() => {
    if (!favorites.length) {
      return null;
    }

    const authorCounts = favorites.reduce((acc, fav) => {
      const key = fav.author || "Unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const entries = Object.entries(authorCounts).sort(
      (a, b) => b[1] - a[1],
    );
    const [topAuthor, topCount] = entries[0];

    return {
      distinctAuthors: entries.length,
      topAuthor,
      topCount,
    };
  }, [favorites]);

  const appStyles = useMemo(() => ({
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: "0",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #1e1b4b 50%, #312e81 75%, #1e293b 100%)",
    backgroundSize: "400% 400%",
    animation: "gradientShift 20s ease infinite",
    position: "relative",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#f1f5f9",
    overflow: "auto",
    boxSizing: "border-box",
    width: "100%",
    isolation: "isolate",
  }), []);

  const cardStyles = useMemo(() => ({
    width: "100%",
    maxWidth: "100%",
    minHeight: "100vh",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderRadius: "0",
    padding: "48px 40px",
    boxShadow: "0 40px 100px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.2) inset, 0 0 150px rgba(99, 102, 241, 0.15)",
    backdropFilter: "blur(40px) saturate(200%)",
    WebkitBackdropFilter: "blur(40px) saturate(200%)",
    border: "2px solid rgba(99, 102, 241, 0.3)",
    display: "flex",
    flexDirection: "column",
    gap: 36,
    margin: "0",
    transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease",
    boxSizing: "border-box",
    animation: "fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    zIndex: 1,
  }), []);

  const quoteCardStyles = useMemo(() => {
    const isHomeTab = activeTab === "home";
    return {
      background: isHomeTab 
        ? "linear-gradient(135deg, #4c5fd8 0%, #5a3d8f 20%, #b872d8 40%, #3a7bc8 60%, #0088a8 80%)"
        : themeMode === "dark"
          ? "linear-gradient(135deg, rgba(76, 95, 216, 0.25) 0%, rgba(90, 61, 143, 0.2) 50%, rgba(58, 123, 200, 0.15) 100%)"
          : "linear-gradient(135deg, rgba(76, 95, 216, 0.12) 0%, rgba(90, 61, 143, 0.1) 50%, rgba(58, 123, 200, 0.08) 100%)",
      backgroundSize: isHomeTab ? "300% 300%" : "100% 100%",
      backgroundColor: isHomeTab 
        ? "rgba(76, 95, 216, 0.15)"
        : themeMode === "dark"
          ? "rgba(15, 23, 42, 0.7)"
          : "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(30px) saturate(200%)",
      WebkitBackdropFilter: "blur(30px) saturate(200%)",
      border: isHomeTab
        ? "3px solid rgba(255, 255, 255, 0.3)"
        : themeMode === "dark"
          ? "3px solid rgba(102, 126, 234, 0.4)"
          : "3px solid rgba(99, 102, 241, 0.3)",
      color: themeMode === "dark" ? "#f1f5f9" : "#0f172a",
      borderRadius: 32,
      padding: "64px 56px",
      position: "relative",
      boxShadow: isHomeTab
        ? "0 24px 64px rgba(76, 95, 216, 0.35), 0 12px 32px rgba(90, 61, 143, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.15) inset, 0 0 100px rgba(76, 95, 216, 0.2)"
        : themeMode === "dark"
          ? "0 40px 100px rgba(76, 95, 216, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.12) inset, 0 0 150px rgba(76, 95, 216, 0.3)"
          : "0 40px 100px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(99, 102, 241, 0.15) inset, 0 0 80px rgba(76, 95, 216, 0.15)",
      minHeight: 280,
      overflow: "hidden",
      transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      animation: isHomeTab ? "fadeInUp 1s cubic-bezier(0.4, 0, 0.2, 1), gradientShift 10s ease infinite" : "fadeInUp 1s cubic-bezier(0.4, 0, 0.2, 1)",
      transform: "translateY(0)",
    };
  }, [activeTab, themeMode]);

  const quoteTextStyles = useMemo(
    () => ({
      fontSize: Math.max(fontSize, 24),
      lineHeight: 2,
      marginBottom: 36,
      fontWeight: 600,
      fontFamily: "'Playfair Display', serif",
      textShadow: themeMode === "dark"
        ? "0 4px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(102, 126, 234, 0.3), 0 0 40px rgba(102, 126, 234, 0.2)"
        : "0 4px 20px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(99, 102, 241, 0.2), 0 0 30px rgba(102, 126, 234, 0.15)",
      color: themeMode === "dark" ? "#ffffff" : "#0f172a",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      letterSpacing: "0.03em",
      textAlign: "center",
    }),
    [fontSize, themeMode],
  );

  const quoteAuthorStyles = useMemo(
    () => ({
      fontSize: Math.max(22, fontSize - 2),
      opacity: 0.98,
      fontStyle: "italic",
      letterSpacing: "0.08em",
      color: themeMode === "dark" ? "rgba(255, 255, 255, 0.95)" : "rgba(15, 23, 42, 0.9)",
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      fontWeight: 500,
      fontFamily: "'Poppins', sans-serif",
      textAlign: "center",
      textShadow: themeMode === "dark"
        ? "0 2px 12px rgba(0, 0, 0, 0.3), 0 0 20px rgba(102, 126, 234, 0.2)"
        : "0 2px 12px rgba(0, 0, 0, 0.1), 0 0 15px rgba(99, 102, 241, 0.15)",
      marginTop: 8,
    }),
    [fontSize, themeMode],
  );

  const sliderTrackStyles = {
    width: "100%",
    marginTop: 12,
    appearance: "none",
    height: 6,
    borderRadius: 999,
    background: "rgba(148, 163, 184, 0.35)",
    outline: "none",
  };

  const sliderThumbStyles = `
    input[type=range]::-webkit-slider-thumb {
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #0284c7;
      cursor: pointer;
      box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.15);
      transition: transform 120ms ease;
    }
    input[type=range]::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #0284c7;
      cursor: pointer;
      box-shadow: 0 0 0 4px rgba(2, 132, 199, 0.15);
      transition: transform 120ms ease;
    }
    input[type=range]:active::-webkit-slider-thumb {
      transform: scale(1.15);
    }
    input[type=range]:active::-moz-range-thumb {
      transform: scale(1.15);
    }
  `;

  const backgroundStyles = `
    ${sliderThumbStyles}
    @keyframes float {
      0%, 100% { transform: translateY(0px) translateX(0px); }
      33% { transform: translateY(-20px) translateX(10px); }
      66% { transform: translateY(10px) translateX(-10px); }
    }
    .home-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                  radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
                  radial-gradient(circle at 50% 50%, rgba(167, 139, 250, 0.1) 0%, transparent 70%);
      animation: float 20s ease-in-out infinite;
      pointer-events: none;
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.4; transform: scale(1); filter: blur(0px); }
      50% { opacity: 0.8; transform: scale(1.1); filter: blur(2px); }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes sparkle {
      0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
      50% { opacity: 1; transform: scale(1) rotate(180deg); }
    }
    .quote-card::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(135deg, #4c5fd8, #5a3d8f, #b872d8, #3a7bc8, #0088a8);
      border-radius: 32px;
      z-index: -1;
      opacity: 0.2;
      filter: blur(25px);
      animation: gradientShift 10s ease infinite;
    }
    @keyframes sparkle {
      0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
      50% { opacity: 1; transform: scale(1) rotate(180deg); }
    }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeInUp {
      from { 
        opacity: 0; 
        transform: translateY(30px) scale(0.95); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes rotate {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    main {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #1e1b4b 50%, #312e81 75%, #1e293b 100%);
      background-size: 400% 400%;
      animation: gradientShift 20s ease infinite;
      border-radius: 0;
      margin-top: 0;
      position: relative;
      overflow: hidden;
    }
    
    .main-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 50px 120px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(99, 102, 241, 0.4) inset, 0 0 200px rgba(99, 102, 241, 0.25) !important;
    }
    .home-container {
      position: relative;
      overflow: hidden;
      isolation: isolate;
    }
    
    .quote-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 40px 100px rgba(102, 126, 234, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.3) inset, 0 0 150px rgba(102, 126, 234, 0.4) !important;
    }
    
    input:focus {
      border-color: #6366f1 !important;
      box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.2), 0 8px 24px rgba(0, 0, 0, 0.4) !important;
      transform: translateY(-2px);
      background-color: rgba(30, 41, 59, 0.95) !important;
    }
    
    input::placeholder {
      color: #64748b !important;
      opacity: 0.7;
    }
    
    input:focus::placeholder {
      opacity: 0.5;
    }
    select option {
      background-color: rgba(30, 41, 59, 0.95) !important;
      color: #f1f5f9 !important;
    }
    main > * {
      position: relative;
      z-index: 1;
    }
    
    /* Ensure tab button labels are always visible */
    .tab-button span {
      display: inline-block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    /* Ensure title is always visible */
    .main-header h1 {
      visibility: visible !important;
      opacity: 1 !important;
      display: block !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
    }
    
    /* Prevent buttons from resizing when language changes */
    .tab-button {
      min-width: 130px !important;
      width: 130px !important;
      height: 44px !important;
      flex: 0 0 auto !important;
    }
    
    .action-button {
      min-width: 160px !important;
      width: auto !important;
    }
    
    /* Ensure main card maintains full size */
    .main-card {
      min-height: 100vh !important;
      width: 100% !important;
      max-width: 100% !important;
      border-radius: 0 !important;
    }
    
    .main-card > div {
      display: flex !important;
      flex-direction: column !important;
      min-height: 100% !important;
      flex: 1 !important;
    }
    
    /* General responsive improvements */
    * {
      box-sizing: border-box !important;
    }
    
    img, video, iframe {
      max-width: 100% !important;
      height: auto !important;
    }
    
    table {
      width: 100% !important;
      display: block !important;
      overflow-x: auto !important;
    }
    
    /* Mobile styles (< 640px) */
    @media (max-width: 639px) {
      main {
        padding: 0 !important;
        max-width: 100% !important;
        overflow-x: hidden !important;
        min-height: 100vh !important;
      }
      .main-card {
        padding: 20px !important;
        border-radius: 0 !important;
        gap: 16px !important;
        margin: 0 !important;
        max-width: 100% !important;
        min-height: 100vh !important;
      }
      .main-header {
        margin-bottom: 16px !important;
      }
      .main-header > div {
        flex-direction: column !important;
        align-items: center !important;
        gap: 8px !important;
        width: 100% !important;
      }
      .main-header h1 {
        font-size: 22px !important;
        margin-bottom: 4px !important;
        line-height: 1.2 !important;
        width: 100% !important;
        padding: 0 4px !important;
      }
      .main-header p {
        font-size: 12px !important;
        margin-bottom: 12px !important;
        padding: 0 8px !important;
        line-height: 1.4 !important;
      }
      .user-info {
        font-size: 11px !important;
        width: 100% !important;
        text-align: center !important;
        align-items: center !important;
      }
      .tab-button {
        padding: 8px 10px !important;
        font-size: 10px !important;
        border-radius: 8px !important;
        min-height: 38px !important;
        min-width: 100px !important;
        gap: 5px !important;
        flex: 1 1 calc(50% - 4px) !important;
        max-width: calc(50% - 4px) !important;
      }
      .tab-button span:first-child {
        font-size: 14px !important;
      }
      .tab-button span:last-child {
        font-size: 10px !important;
      }
      .quote-card {
        padding: 20px 16px !important;
        border-radius: 16px !important;
        min-height: 150px !important;
        margin-bottom: 16px !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .quote-text {
        font-size: 17px !important;
        line-height: 1.6 !important;
        margin-bottom: 14px !important;
        padding: 0 4px !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
      }
      .quote-author {
        font-size: 14px !important;
        padding: 0 4px !important;
      }
      .quote-quote-mark {
        font-size: 36px !important;
        top: -6px !important;
        left: 10px !important;
      }
      .action-button {
        padding: 10px 14px !important;
        font-size: 12px !important;
        min-width: 140px !important;
        width: 100% !important;
        border-radius: 8px !important;
        margin-bottom: 8px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 6px !important;
      }
      .logout-button {
        padding: 6px 12px !important;
        font-size: 11px !important;
        border-radius: 8px !important;
        width: auto !important;
      }
      input, select, textarea {
        font-size: 14px !important;
        padding: 10px 12px !important;
        min-height: 40px !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      label {
        font-size: 12px !important;
        margin-bottom: 4px !important;
        display: block !important;
      }
      h3 {
        font-size: 14px !important;
        margin-bottom: 12px !important;
      }
      /* Navigation container */
      .main-header > div:last-child {
        gap: 6px !important;
        width: 100% !important;
        padding: 0 4px !important;
      }
      /* Forms and filters */
      div[style*="flex"][style*="gap"] {
        flex-direction: column !important;
      }
      div[style*="flex"][style*="gap"] > div {
        width: 100% !important;
        min-width: 100% !important;
        flex: 1 1 100% !important;
      }
      /* Ensure buttons don't overflow */
      button {
        max-width: 100% !important;
        word-wrap: break-word !important;
      }
      /* Card containers */
      div[style*="backgroundColor"][style*="rgba(255, 255, 255"] {
        padding: 16px !important;
        border-radius: 12px !important;
      }
      /* Prevent horizontal scroll */
      body, html {
        overflow-x: hidden !important;
        width: 100% !important;
      }
    }
    
    /* Tablet styles (640px - 1023px) */
    @media (min-width: 640px) and (max-width: 1023px) {
      main {
        padding: 0 !important;
        max-width: 100% !important;
      }
      .main-card {
        padding: 32px !important;
        border-radius: 0 !important;
        gap: 24px !important;
        max-width: 100% !important;
        margin: 0 !important;
        min-height: 100vh !important;
      }
      .main-header {
        margin-bottom: 24px !important;
      }
      .main-header h1 {
        font-size: 32px !important;
        margin-bottom: 6px !important;
      }
      .main-header p {
        font-size: 15px !important;
        margin-bottom: 20px !important;
      }
      .user-info {
        font-size: 13px !important;
      }
      .tab-button {
        padding: 10px 16px !important;
        font-size: 12px !important;
        border-radius: 10px !important;
        min-height: 42px !important;
        gap: 7px !important;
        flex: 1 1 calc(25% - 6px) !important;
        max-width: calc(25% - 6px) !important;
      }
      .tab-button span:first-child {
        font-size: 17px !important;
      }
      .tab-button span:last-child {
        font-size: 12px !important;
      }
      .quote-card {
        padding: 28px 24px !important;
        border-radius: 20px !important;
        min-height: 180px !important;
        margin-bottom: 20px !important;
      }
      .quote-text {
        font-size: 19px !important;
        line-height: 1.65 !important;
        margin-bottom: 18px !important;
      }
      .quote-author {
        font-size: 15px !important;
      }
      .quote-quote-mark {
        font-size: 52px !important;
        top: -12px !important;
        left: 20px !important;
      }
      .action-button {
        padding: 12px 18px !important;
        font-size: 13px !important;
        min-width: 120px !important;
        border-radius: 10px !important;
      }
      .logout-button {
        padding: 8px 16px !important;
        font-size: 12px !important;
        border-radius: 10px !important;
      }
      input, select, textarea {
        font-size: 15px !important;
        padding: 12px 14px !important;
      }
      label {
        font-size: 13px !important;
      }
      h3 {
        font-size: 15px !important;
      }
    }
    
    /* Laptop styles (1024px - 1439px) */
    @media (min-width: 1024px) and (max-width: 1439px) {
      main {
        padding: 0 !important;
        max-width: 100% !important;
        margin: 0 !important;
      }
      .main-card {
        padding: 40px !important;
        border-radius: 0 !important;
        gap: 28px !important;
        max-width: 100% !important;
        min-height: 100vh !important;
      }
      .main-header h1 {
        font-size: 42px !important;
      }
      .main-header p {
        font-size: 17px !important;
      }
      .tab-button {
        padding: 11px 18px !important;
        font-size: 13px !important;
        gap: 8px !important;
        flex: 0 1 auto !important;
        max-width: none !important;
      }
      .tab-button span:first-child {
        font-size: 18px !important;
      }
      .quote-card {
        padding: 36px 32px !important;
        border-radius: 24px !important;
        min-height: 200px !important;
      }
      .quote-text {
        font-size: 22px !important;
        line-height: 1.7 !important;
      }
      .quote-author {
        font-size: 17px !important;
      }
      .action-button {
        padding: 13px 20px !important;
        font-size: 14px !important;
        min-width: 140px !important;
      }
    }
    
    /* Desktop styles (>= 1440px) */
    @media (min-width: 1440px) {
      main {
        padding: 0 !important;
        max-width: 100% !important;
        margin: 0 !important;
      }
      .main-card {
        padding: 48px !important;
        border-radius: 0 !important;
        gap: 32px !important;
        max-width: 100% !important;
        min-height: 100vh !important;
      }
      .main-header h1 {
        font-size: 48px !important;
      }
      .main-header p {
        font-size: 18px !important;
      }
      .tab-button {
        padding: 12px 20px !important;
        font-size: 14px !important;
        gap: 8px !important;
      }
      .tab-button span:first-child {
        font-size: 18px !important;
      }
      .quote-card {
        padding: 48px 40px !important;
        border-radius: 28px !important;
        min-height: 220px !important;
      }
      .quote-text {
        font-size: 24px !important;
        line-height: 1.75 !important;
      }
      .quote-author {
        font-size: 18px !important;
      }
      .action-button {
        padding: 14px 24px !important;
        font-size: 15px !important;
        min-width: 160px !important;
      }
    }
    
    /* Touch device optimizations */
    @media (hover: none) and (pointer: coarse) {
      button, a, input, select, textarea {
        min-height: 44px;
        min-width: 44px;
      }
      button:active {
        transform: scale(0.98);
      }
      .tab-button:active {
        transform: scale(0.95);
      }
    }
    
    /* Landscape mobile optimization */
    @media (max-width: 896px) and (orientation: landscape) {
      main {
        padding: 10px !important;
      }
      .main-card {
        padding: 14px !important;
        min-height: 85vh !important;
      }
      .main-header {
        margin-bottom: 16px !important;
      }
      .main-header h1 {
        font-size: 22px !important;
        margin-bottom: 2px !important;
      }
      .main-header p {
        font-size: 12px !important;
        margin-bottom: 12px !important;
      }
      .tab-button {
        padding: 6px 10px !important;
        font-size: 10px !important;
        min-height: 36px !important;
        gap: 5px !important;
      }
      .tab-button span:first-child {
        font-size: 14px !important;
      }
      .tab-button span:last-child {
        font-size: 10px !important;
      }
      .quote-card {
        min-height: 120px !important;
        padding: 14px 16px !important;
        margin-bottom: 12px !important;
      }
      .quote-text {
        font-size: 15px !important;
        line-height: 1.4 !important;
        margin-bottom: 10px !important;
      }
      .quote-author {
        font-size: 12px !important;
      }
      .quote-quote-mark {
        font-size: 36px !important;
        top: -6px !important;
        left: 10px !important;
      }
      .action-button {
        padding: 8px 12px !important;
        font-size: 11px !important;
        margin-bottom: 6px !important;
      }
    }
    
    /* Extra small devices (<= 375px) */
    @media (max-width: 375px) {
      main {
        padding: 6px !important;
      }
      .main-card {
        padding: 10px !important;
        border-radius: 12px !important;
        gap: 10px !important;
      }
      .main-header h1 {
        font-size: 18px !important;
      }
      .main-header p {
        font-size: 11px !important;
      }
      .tab-button {
        flex: 1 1 100% !important;
        max-width: 100% !important;
        margin-bottom: 4px !important;
        padding: 6px 8px !important;
        font-size: 9px !important;
        min-height: 36px !important;
      }
      .tab-button span:first-child {
        font-size: 13px !important;
      }
      .tab-button span:last-child {
        font-size: 9px !important;
      }
      .quote-card {
        padding: 16px 12px !important;
        min-height: 140px !important;
        border-radius: 12px !important;
      }
      .quote-text {
        font-size: 15px !important;
        line-height: 1.5 !important;
      }
      .quote-author {
        font-size: 12px !important;
      }
      .quote-quote-mark {
        font-size: 32px !important;
        top: -4px !important;
        left: 8px !important;
      }
      .action-button {
        padding: 9px 12px !important;
        font-size: 11px !important;
      }
    }
    
    /* Large desktop (>= 1920px) */
    @media (min-width: 1920px) {
      main {
        max-width: 1600px !important;
      }
      .main-card {
        padding: 48px !important;
      }
      .quote-card {
        padding: 56px 48px !important;
      }
    }
  `;

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #1e1b4b 50%, #312e81 75%, #1e293b 100%)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 20s ease infinite",
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            backgroundColor: themeMode === "dark" ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(40px) saturate(200%)",
            WebkitBackdropFilter: "blur(40px) saturate(200%)",
            borderRadius: 32,
            padding: "48px 40px",
            textAlign: "center",
            border: themeMode === "dark" ? "2px solid rgba(99, 102, 241, 0.3)" : "2px solid rgba(99, 102, 241, 0.1)",
            boxShadow: themeMode === "dark"
              ? "0 40px 100px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.2) inset, 0 0 150px rgba(99, 102, 241, 0.15)"
              : "0 40px 100px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
            position: "relative",
            zIndex: 1,
          }}
        >
          <p style={{ fontSize: 16, color: themeMode === "dark" ? "#94a3b8" : "#64748b", fontWeight: 500 }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <style>{backgroundStyles}</style>
      <main style={appStyles} className="home-container">
        {/* Interactive mouse-following particle background - same as login */}
        <InteractiveBackground
          particleCount={50}
          intensity="normal"
          zIndex={0}
        />
        {/* Decorative Background Elements - matching login screen */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(167, 139, 250, 0.1) 0%, transparent 70%)",
          animation: "float 20s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 0,
        }} />
        
        <section style={cardStyles} className="main-card">
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", flex: 1, position: "relative", zIndex: 1 }}>
          <header style={{ textAlign: "center", marginBottom: 40, position: "relative" }} className="main-header">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              {user && (
                <div 
                  style={{ 
                    fontSize: 15, 
                    color: themeMode === "dark" ? "#cbd5e1" : "#475569", 
                    fontWeight: 600,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 4,
                    background: themeMode === "dark"
                      ? "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.15) 100%)"
                      : "linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%)",
                    padding: "14px 20px",
                    borderRadius: 18,
                    border: themeMode === "dark" ? "2px solid rgba(102, 126, 234, 0.3)" : "2px solid rgba(99, 102, 241, 0.25)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    boxShadow: themeMode === "dark"
                      ? "0 8px 24px rgba(102, 126, 234, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                      : "0 8px 24px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }} 
                  className="user-info"
                  title={`User ID: ${user.id} | Username: ${user.username}`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                    e.currentTarget.style.boxShadow = themeMode === "dark"
                      ? "0 12px 32px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
                      : "0 12px 32px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.7)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = themeMode === "dark"
                      ? "0 8px 24px rgba(102, 126, 234, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                      : "0 8px 24px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)";
                  }}
                >
                  <div style={{ 
                    color: themeMode === "dark" ? "#e2e8f0" : "#0f172a",
                    fontSize: 16,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}>
                    <span style={{ fontSize: 20 }}>👤</span>
                    {user.name}
                  </div>
                  <div style={{ 
                    fontSize: 13, 
                    opacity: 0.85, 
                    color: themeMode === "dark" ? "#94a3b8" : "#64748b",
                    fontWeight: 500,
                  }}>
                    @{user.username}
                  </div>
                </div>
              )}
              <h1 style={{ 
                fontSize: 64, 
                fontWeight: 900, 
                marginBottom: 12, 
                flex: 1, 
                textAlign: "center",
                fontFamily: "'Playfair Display', serif",
                backgroundImage: "linear-gradient(135deg, #4c5fd8 0%, #5a3d8f 20%, #b872d8 40%, #3a7bc8 60%, #0088a8 80%)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.03em",
                color: "#667eea",
                display: "block",
                width: "100%",
                visibility: "visible",
                opacity: 1,
                animation: "gradientShift 8s ease infinite",
                textShadow: "0 0 40px rgba(102, 126, 234, 0.3)",
                lineHeight: 1.2,
              }}>
                {t("quoteGenerator", language)}
              </h1>
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="logout-button"
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  border: "2px solid rgba(248, 113, 113, 0.3)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: logoutLoading ? "not-allowed" : "pointer",
                  backgroundColor: logoutLoading ? "rgba(148, 163, 184, 0.15)" : "rgba(248, 113, 113, 0.15)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  color: logoutLoading ? "#94a3b8" : "#fca5a5",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  minHeight: "44px",
                  minWidth: "120px",
                  width: "auto",
                  touchAction: "manipulation",
                  opacity: logoutLoading ? 0.6 : 1,
                  boxShadow: "0 4px 12px rgba(248, 113, 113, 0.2)",
                }}
                onMouseEnter={(e) => {
                  if (!logoutLoading) {
                    e.currentTarget.style.backgroundColor = "rgba(248, 113, 113, 0.25)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(248, 113, 113, 0.3)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!logoutLoading) {
                    e.currentTarget.style.backgroundColor = "rgba(248, 113, 113, 0.15)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(248, 113, 113, 0.2)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {logoutLoading ? t("loggingOut", language) : `🚪 ${t("logout", language)}`}
              </button>
            </div>
            
            {logoutMessage && (
              <div
                style={{
                  backgroundColor: logoutMessage.includes("successful") 
                    ? "rgba(16, 185, 129, 0.15)" 
                    : "rgba(239, 68, 68, 0.15)",
                  color: logoutMessage.includes("successful") 
                    ? "#059669" 
                    : "#dc2626",
                  borderRadius: 14,
                  padding: "12px 18px",
                  fontSize: 14,
                  fontWeight: 500,
                  border: `1px solid ${logoutMessage.includes("successful") 
                    ? "rgba(16, 185, 129, 0.2)" 
                    : "rgba(239, 68, 68, 0.2)"}`,
                  fontFamily: "'Inter', sans-serif",
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                {logoutMessage.includes("successful") ? "✓ " : "✗ "}
                {logoutMessage}
              </div>
            )}
            
            <p style={{ 
              fontSize: 20, 
              fontWeight: 600, 
              color: themeMode === "dark" ? "#cbd5e1" : "#64748b", 
              marginBottom: 40,
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "0.02em",
              textAlign: "center",
              background: themeMode === "dark"
                ? "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)"
                : "linear-gradient(135deg, #64748b 0%, #475569 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {t("discoverShare", language)}
            </p>
            
            {/* Tab Navigation */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                marginBottom: 24,
                width: "100%",
                maxWidth: "100%",
              }}
            >
              {[
                { id: "home", label: t("home", language), icon: "🏠" },
                { id: "search", label: t("search", language), icon: "🔍" },
                { id: "browse", label: t("browse", language), icon: "📚" },
                { id: "submit", label: t("submit", language), icon: "✍️" },
                { id: "authors", label: t("authors", language), icon: "👥" },
                { id: "stats", label: t("stats", language), icon: "📊" },
                { id: "favorites", label: t("favorites", language), icon: "⭐" },
                { id: "collections", label: t("collections", language), icon: "📁" },
                { id: "settings", label: t("settings", language), icon: "⚙️" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === "browse") {
                      void fetchAllQuotes(1, 10, quotesFilterAuthor || null, quotesFilterCategory || null, quotesFilterSearch || null);
                    } else if (tab.id === "authors") {
                      void fetchAuthors();
                    } else if (tab.id === "stats") {
                      void fetchStats();
                    } else if (tab.id === "collections") {
                      setSelectedCollection(null);
                      void fetchCollections();
                    }
                  }}
                  className="tab-button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "14px 24px",
                    borderRadius: 18,
                    border: "none",
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    background: activeTab === tab.id 
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #4facfe 100%)"
                      : "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    color: activeTab === tab.id ? "white" : (themeMode === "dark" ? "#e2e8f0" : "#0f172a"),
                    border: activeTab === tab.id ? "2px solid rgba(255, 255, 255, 0.3)" : "2px solid rgba(99, 102, 241, 0.3)",
                    boxShadow:
                      activeTab === tab.id
                        ? "0 12px 32px rgba(102, 126, 234, 0.5), 0 8px 16px rgba(118, 75, 162, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
                        : "0 6px 20px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                    minHeight: "52px",
                    height: "52px",
                    minWidth: "140px",
                    width: "140px",
                    flex: "0 0 auto",
                    touchAction: "manipulation",
                    transform: activeTab === tab.id ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  <span style={{ fontSize: "18px", display: "inline-block", visibility: "visible", flexShrink: 0 }}>{tab.icon}</span>
                  <span style={{ display: "inline-block", visibility: "visible", whiteSpace: "nowrap", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{tab.label}</span>
                </button>
              ))}
            </div>
          </header>

          {/* Home Tab - Main Quote Display */}
          {activeTab === "home" && (
            <div>
              {/* Quote Filters */}
              <div
                style={{
                  backgroundColor: themeMode === "dark" ? "rgba(15, 23, 42, 0.75)" : "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(30px) saturate(200%)",
                  WebkitBackdropFilter: "blur(30px) saturate(200%)",
                  borderRadius: 24,
                  padding: "32px",
                  marginBottom: 32,
                  boxShadow: themeMode === "dark"
                    ? "0 16px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(102, 126, 234, 0.3) inset, 0 8px 24px rgba(102, 126, 234, 0.2)"
                    : "0 16px 48px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(99, 102, 241, 0.2) inset, 0 8px 24px rgba(102, 126, 234, 0.1)",
                  border: themeMode === "dark" ? "2px solid rgba(102, 126, 234, 0.3)" : "2px solid rgba(99, 102, 241, 0.25)",
                }}
              >
                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: themeMode === "dark" ? "#e2e8f0" : "#0f172a",
                    marginBottom: 24,
                    fontFamily: "'Poppins', sans-serif",
                    background: "linear-gradient(135deg, #4c5fd8 0%, #5a3d8f 40%, #b872d8 100%)",
                    backgroundSize: "200% 200%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    animation: "gradientShift 6s ease infinite",
                    letterSpacing: "0.02em",
                  }}
                >
                  {t("filterQuote", language)}
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "flex-end",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#cbd5e1",
                        marginBottom: 8,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {t("authorOptional", language)}
                    </label>
                    <input
                      type="text"
                      value={quoteFilterAuthor}
                      onChange={(e) => setQuoteFilterAuthor(e.target.value)}
                      placeholder={t("enterAuthorName", language)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: 12,
                        border: "2px solid rgba(99, 102, 241, 0.3)",
                        fontSize: 14,
                        backgroundColor: "rgba(30, 41, 59, 0.8)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        outline: "none",
                        fontFamily: "'Inter', sans-serif",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        color: "#f1f5f9",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          void getQuote(false, quoteFilterAuthor || null, quoteFilterCategory || null);
                        }
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#cbd5e1",
                        marginBottom: 8,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {t("categoryOptional", language)}
                    </label>
                    <input
                      type="text"
                      value={quoteFilterCategory}
                      onChange={(e) => setQuoteFilterCategory(e.target.value)}
                      placeholder={t("enterCategory", language)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: 12,
                        border: "2px solid rgba(99, 102, 241, 0.3)",
                        fontSize: 14,
                        backgroundColor: "rgba(30, 41, 59, 0.8)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        outline: "none",
                        fontFamily: "'Inter', sans-serif",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        color: "#f1f5f9",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          void getQuote(false, quoteFilterAuthor || null, quoteFilterCategory || null);
                        }
                      }}
                    />
                  </div>
                  {(quoteFilterAuthor || quoteFilterCategory) && (
                    <button
                      onClick={() => {
                        setQuoteFilterAuthor("");
                        setQuoteFilterCategory("");
                        void getQuote();
                      }}
                      style={{
                        ...buttonStyles.base,
                        ...buttonStyles.outline,
                        minWidth: 100,
                        padding: "10px 16px",
                        fontSize: 13,
                      }}
                    >
                      {t("clearFilters", language)}
                    </button>
                  )}
                </div>
                {(quoteFilterAuthor || quoteFilterCategory) && (
                  <div
                    style={{
                      marginTop: 16,
                      fontSize: 13,
                      color: "#94a3b8",
                      fontStyle: "italic",
                      padding: "10px 14px",
                      backgroundColor: "rgba(99, 102, 241, 0.1)",
                      borderRadius: 10,
                      border: "1px solid rgba(99, 102, 241, 0.2)",
                    }}
                  >
                    {t("activeFilters", language)}:{" "}
                    {quoteFilterAuthor && <span style={{ color: "#cbd5e1" }}>Author: <strong>{quoteFilterAuthor}</strong></span>}
                    {quoteFilterAuthor && quoteFilterCategory && <span style={{ margin: "0 8px" }}>•</span>}
                    {quoteFilterCategory && <span style={{ color: "#cbd5e1" }}>Category: <strong>{quoteFilterCategory}</strong></span>}
                  </div>
                )}
              </div>

              <article style={quoteCardStyles} className="quote-card">
                {/* Decorative Corner Elements */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100px",
                  height: "100px",
                  borderTop: themeMode === "dark" ? "3px solid rgba(102, 126, 234, 0.4)" : "3px solid rgba(99, 102, 241, 0.3)",
                  borderLeft: themeMode === "dark" ? "3px solid rgba(102, 126, 234, 0.4)" : "3px solid rgba(99, 102, 241, 0.3)",
                  borderTopLeftRadius: 32,
                  opacity: 0.6,
                }} />
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "100px",
                  height: "100px",
                  borderBottom: themeMode === "dark" ? "3px solid rgba(102, 126, 234, 0.4)" : "3px solid rgba(99, 102, 241, 0.3)",
                  borderRight: themeMode === "dark" ? "3px solid rgba(102, 126, 234, 0.4)" : "3px solid rgba(99, 102, 241, 0.3)",
                  borderBottomRightRadius: 32,
                  opacity: 0.6,
                }} />
                
                {/* Decorative Dots Pattern */}
                <div style={{
                  position: "absolute",
                  top: "20px",
                  right: "30px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: themeMode === "dark" ? "rgba(102, 126, 234, 0.5)" : "rgba(99, 102, 241, 0.4)",
                  boxShadow: themeMode === "dark"
                    ? "0 0 20px rgba(102, 126, 234, 0.6), 30px 0 0 rgba(102, 126, 234, 0.4), 60px 0 0 rgba(118, 75, 162, 0.4)"
                    : "0 0 15px rgba(99, 102, 241, 0.5), 30px 0 0 rgba(99, 102, 241, 0.3), 60px 0 0 rgba(118, 75, 162, 0.3)",
                  animation: "pulse 3s ease-in-out infinite",
                }} />
                
                <span
                  aria-hidden="true"
                  className="quote-quote-mark"
                  style={{
                    fontSize: 140,
                    position: "absolute",
                    top: -40,
                    left: 50,
                    opacity: 0.25,
                    fontWeight: 900,
                    fontFamily: "'Playfair Display', serif",
                    background: themeMode === "dark"
                      ? "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(102, 126, 234, 0.3) 50%, rgba(118, 75, 162, 0.2) 100%)"
                      : "linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.3) 50%, rgba(79, 172, 254, 0.2) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    transform: "rotate(-8deg)",
                    animation: "float 8s ease-in-out infinite",
                    filter: "blur(0.5px)",
                  }}
                >
                  "
                </span>
                <p style={quoteTextStyles} className="quote-text">
                  {loading ? t("fetchingQuote", language) : translating ? t("loading", language) : quote.text}
                </p>
                {quote.author && (
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    gap: 12,
                    marginTop: 16,
                  }}>
                    <div style={{
                      width: "40px",
                      height: "2px",
                      background: themeMode === "dark"
                        ? "linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.6), transparent)"
                        : "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent)",
                    }} />
                    <p style={quoteAuthorStyles} className="quote-author">— {quote.author}</p>
                    <div style={{
                      width: "40px",
                      height: "2px",
                      background: themeMode === "dark"
                        ? "linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.6), transparent)"
                        : "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent)",
                    }} />
                  </div>
                )}
              </article>

              {error && (
                <p
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    color: "#fca5a5",
                    borderRadius: 14,
                    padding: "14px 20px",
                    fontSize: 14,
                    marginTop: 20,
                    textAlign: "center",
                    border: "2px solid rgba(239, 68, 68, 0.2)",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
                    fontWeight: 500,
                  }}
                >
                  ✗ {error}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 20,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginTop: 40,
                  padding: "32px",
                  background: themeMode === "dark"
                    ? "linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%)"
                    : "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(248, 250, 252, 0.4) 100%)",
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                  borderRadius: 24,
                  border: themeMode === "dark" ? "2px solid rgba(102, 126, 234, 0.2)" : "2px solid rgba(99, 102, 241, 0.15)",
                  boxShadow: themeMode === "dark"
                    ? "0 12px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
                    : "0 12px 40px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
                }}
              >
                <button
                  onClick={() => void getQuote(false, quoteFilterAuthor || null, quoteFilterCategory || null)}
                  disabled={loading}
                  className="action-button"
                  style={{
                    ...buttonStyles.base,
                    ...buttonStyles.primary,
                    opacity: loading ? 0.65 : 1,
                  }}
                >
                  {loading ? "Loading..." : "🎲 New Quote"}
                </button>
                <button
                  onClick={() => void copyQuote()}
                  disabled={loading}
                  className="action-button"
                  style={{
                    ...buttonStyles.base,
                    ...buttonStyles.secondary,
                  }}
                >
                  {copied ? `✓ ${t("copied", language)}` : `📋 ${t("copy", language)}`}
                </button>
                <button
                  onClick={() => (isSpeaking ? stopSpeaking() : speakQuote())}
                  disabled={loading || !speechSupport || isDefaultQuote}
                  className="action-button"
                  style={{
                    ...buttonStyles.base,
                    ...buttonStyles.secondary,
                    backgroundColor: isSpeaking ? "#facc15" : undefined,
                    opacity: speechSupport ? 1 : 0.6,
                  }}
                >
                  {speechSupport
                    ? isSpeaking
                      ? `⏸️ ${t("stop", language)}`
                      : `🔊 ${t("listen", language)}`
                    : `🔇 ${t("unavailable", language)}`}
                </button>
                <button
                  onClick={() => void shareQuote()}
                  disabled={loading}
                  className="action-button"
                  style={{
                    ...buttonStyles.base,
                    ...buttonStyles.secondary,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>📤</span>
                  <span>{t("share", language)}</span>
                </button>
                <button
                  onClick={() => addFavorite()}
                  disabled={loading || isDefaultQuote || isFavorite}
                  className="action-button"
                  style={{
                    ...buttonStyles.base,
                    ...buttonStyles.secondary,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backgroundColor: isFavorite ? "#22c55e" : undefined,
                    color: isFavorite ? "white" : "#e2e8f0",
                  }}
                >
                  <span style={{ fontSize: "16px" }}>{isFavorite ? "✓" : "⭐"}</span>
                  <span>{t("favorite", language)}</span>
                </button>
                <div style={{ position: "relative" }} data-collection-dropdown>
                  <button
                    onClick={() => {
                      if (collections.length === 0) {
                        setActiveTab("collections");
                        void fetchCollections();
                      } else {
                        setShowCollectionDropdown(!showCollectionDropdown);
                      }
                    }}
                    disabled={loading || isDefaultQuote}
                    className="action-button"
                    style={{
                      ...buttonStyles.base,
                      ...buttonStyles.secondary,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>📁</span>
                    <span>{t("addToCollection", language)}</span>
                  </button>
                  {showCollectionDropdown && collections.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        marginTop: 8,
                        backgroundColor: "rgba(15, 23, 42, 0.98)",
                        backdropFilter: "blur(20px) saturate(180%)",
                        WebkitBackdropFilter: "blur(20px) saturate(180%)",
                        border: "2px solid rgba(99, 102, 241, 0.3)",
                        borderRadius: 12,
                        padding: "12px",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.2) inset",
                        zIndex: 10000,
                        minWidth: 200,
                        maxHeight: 300,
                        overflowY: "auto",
                      }}
                      onClick={(e) => e.stopPropagation()}
                      data-collection-dropdown
                    >
                      {collections.map((col) => {
                        const isInCollection = col.quotes.some(
                          (q) => q.text === quote.text && q.author === quote.author
                        );
                        return (
                          <button
                            key={col.id}
                            onClick={() => {
                              if (isInCollection) {
                                const quoteInCollection = col.quotes.find(
                                  (q) => q.text === quote.text && q.author === quote.author
                                );
                                if (quoteInCollection) {
                                  removeQuoteFromCollection(col.id, quoteInCollection);
                                }
                              } else {
                                addQuoteToCollection(col.id, quote);
                              }
                              setShowCollectionDropdown(false);
                            }}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: 8,
                              border: "none",
                              backgroundColor: isInCollection ? "rgba(239, 68, 68, 0.1)" : "rgba(102, 126, 234, 0.1)",
                              color: isInCollection ? "#ef4444" : "#667eea",
                              cursor: "pointer",
                              fontSize: 13,
                              marginBottom: 4,
                              textAlign: "left",
                            }}
                          >
                            {isInCollection ? "✓ " : "+ "}
                            {col.name}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => {
                          setShowCollectionDropdown(false);
                          setEditingCollection(null);
                          setCollectionName("");
                          setActiveTab("collections");
                          void fetchCollections();
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: "1px solid rgba(102, 126, 234, 0.3)",
                          backgroundColor: "transparent",
                          color: "#667eea",
                          cursor: "pointer",
                          fontSize: 13,
                          marginTop: 8,
                        }}
                      >
                        + {t("createCollection", language)}
                </button>
                    </div>
                  )}
                </div>
              </div>

              {history.length > 0 && (
                <aside
                  style={{
                    marginTop: 24,
                    textAlign: "left",
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "2px solid rgba(99, 102, 241, 0.2)",
                    padding: "20px 22px",
                    borderRadius: 22,
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <p
                    style={{
                      fontSize: 15,
                      marginBottom: 14,
                      fontWeight: 900,
                      color: "#e2e8f0",
                    }}
                  >
                    📜 Recently Viewed
                  </p>
                  <ul
                    style={{
                      listStyle: "none",
                      display: "grid",
                      gap: 14,
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    {history.map((item) => (
                      <li
                        key={item.id}
                        style={{
                          backgroundColor: "rgba(30, 41, 59, 0.6)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                          border: "1px solid rgba(99, 102, 241, 0.2)",
                          padding: "16px 18px",
                          borderRadius: 16,
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 15,
                            marginBottom: 8,
                            color: "#f1f5f9",
                          }}
                        >
                          {item.text}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <span style={{ fontSize: 13, color: "#cbd5e1" }}>
                            — {item.author}
                          </span>
                          <button
                            onClick={() => restoreQuote(item)}
                            style={{
                              ...buttonStyles.base,
                              ...buttonStyles.outline,
                              minWidth: 0,
                              padding: "8px 16px",
                              fontSize: 13,
                            }}
                          >
                            View
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </aside>
              )}
            </div>
          )}

          {/* Search Tab */}
          {activeTab === "search" && (
            <div>
              <form onSubmit={handleSearchSubmit}>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    marginBottom: 20,
                  }}
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      // Clear results when query changes
                      if (searchResults.length > 0) {
                        setSearchResults([]);
                        setShowSearch(false);
                      }
                    }}
                    placeholder={t("searchQuotesPlaceholder", language)}
                    style={{
                      flex: 1,
                      minWidth: 200,
                      padding: "14px 18px",
                      borderRadius: 12,
                      border: "2px solid rgba(99, 102, 241, 0.3)",
                      fontSize: 15,
                      backgroundColor: "rgba(30, 41, 59, 0.8)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      outline: "none",
                      color: "#f1f5f9",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
                    }}
                  />
                  <select
                    value={searchField}
                    onChange={(e) => {
                      setSearchField(e.target.value);
                      // Clear search results when field changes
                      setSearchResults([]);
                      setSearchError(null);
                      setShowSearch(false);
                    }}
                    style={{
                      padding: "14px 18px",
                      borderRadius: 12,
                      border: "2px solid rgba(99, 102, 241, 0.3)",
                      fontSize: 15,
                      backgroundColor: "rgba(30, 41, 59, 0.8)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      cursor: "pointer",
                      outline: "none",
                      color: "#f1f5f9",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <option value="all">All Fields</option>
                    <option value="text">Text Only</option>
                    <option value="author">Author Only</option>
                    <option value="category">Category Only</option>
                  </select>
                  <button
                    type="submit"
                    disabled={searchLoading || !searchQuery.trim()}
                    style={{
                      ...buttonStyles.base,
                      ...buttonStyles.primary,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      minWidth: 120,
                      opacity: searchLoading || !searchQuery.trim() ? 0.6 : 1,
                    }}
                  >
                    {searchLoading ? (
                      "Searching..."
                    ) : (
                      <>
                        <span style={{ fontSize: "16px" }}>🔍</span>
                        <span>Search</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {searchError && (
                <p
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    color: "#fca5a5",
                    borderRadius: 12,
                    padding: "14px 18px",
                    fontSize: 14,
                    marginBottom: 20,
                    border: "2px solid rgba(239, 68, 68, 0.2)",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
                    fontWeight: 500,
                  }}
                >
                  ✗ {searchError}
                </p>
              )}

              {searchResults.length > 0 && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 900,
                        color: "#e2e8f0",
                      }}
                    >
                      Found {searchPagination?.total || searchResults.length} result
                      {searchPagination?.total !== 1 ? "s" : ""}
                    </p>
                    <span
                      style={{
                        fontSize: 12,
                        padding: "6px 12px",
                        borderRadius: 8,
                        backgroundColor: "rgba(102, 126, 234, 0.1)",
                        color: "#667eea",
                        fontWeight: 600,
                      }}
                    >
                      Searching in: {searchField === "all" ? "All Fields" : searchField === "text" ? "Text Only" : searchField === "author" ? "Author Only" : "Category Only"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gap: 14,
                      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    }}
                  >
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => {
                          handleSearchResultClick(result);
                          setActiveTab("home");
                        }}
                        style={{
                          backgroundColor: "rgba(15, 23, 42, 0.6)",
                          backdropFilter: "blur(20px) saturate(180%)",
                          WebkitBackdropFilter: "blur(20px) saturate(180%)",
                          border: "2px solid rgba(99, 102, 241, 0.2)",
                          borderRadius: 16,
                          padding: "18px 20px",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                          cursor: "pointer",
                          transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.3) inset";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset";
                        }}
                      >
                        <p
                          style={{
                            fontSize: 15,
                            lineHeight: 1.6,
                            color: "#f1f5f9",
                            marginBottom: 12,
                            fontWeight: 500,
                          }}
                        >
                          "{result.text}"
                        </p>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              color: "#cbd5e1",
                              fontStyle: "italic",
                            }}
                          >
                            — {result.author}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              padding: "4px 10px",
                              borderRadius: 12,
                              backgroundColor: "rgba(148, 163, 184, 0.15)",
                              color: "#94a3b8",
                              textTransform: "capitalize",
                            }}
                          >
                            {result.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {searchPagination && searchPagination.totalPages > 1 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 12,
                        marginTop: 24,
                      }}
                    >
                      <button
                        onClick={() => {
                          if (searchPagination.hasPreviousPage) {
                            void searchQuotes(
                              searchQuery,
                              searchField,
                              searchPage - 1,
                            );
                          }
                        }}
                        disabled={!searchPagination.hasPreviousPage}
                        style={{
                          ...buttonStyles.base,
                          ...buttonStyles.outline,
                          minWidth: 100,
                          opacity: searchPagination.hasPreviousPage ? 1 : 0.5,
                        }}
                      >
                        ← Previous
                      </button>
                      <span style={{ fontSize: 14, fontWeight: 900, color: "#e2e8f0" }}>
                        Page {searchPagination.page} of {searchPagination.totalPages}
                      </span>
                      <button
                        onClick={() => {
                          if (searchPagination.hasNextPage) {
                            void searchQuotes(
                              searchQuery,
                              searchField,
                              searchPage + 1,
                            );
                          }
                        }}
                        disabled={!searchPagination.hasNextPage}
                        style={{
                          ...buttonStyles.base,
                          ...buttonStyles.outline,
                          minWidth: 100,
                          opacity: searchPagination.hasNextPage ? 1 : 0.5,
                        }}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!searchLoading &&
                searchResults.length === 0 &&
                showSearch &&
                searchQuery.trim().length > 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 15,
                        color: "#cbd5e1",
                        fontWeight: 500,
                        marginBottom: 8,
                      }}
                    >
                      {t("noQuotesFound", language)} "{searchQuery}"
                    </p>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#94a3b8",
                        marginTop: 12,
                        padding: "12px 16px",
                        backgroundColor: "rgba(102, 126, 234, 0.05)",
                        borderRadius: 10,
                        display: "inline-block",
                      }}
                    >
                      <strong>Searching in: {searchField === "all" ? "All Fields" : searchField === "text" ? "Text Only" : searchField === "author" ? "Author Only" : "Category Only"}</strong>
                      <br />
                      {searchField === "author" && (
                        <>Make sure you entered an <strong>author name</strong> (e.g., "Steve Jobs"), not quote text.</>
                      )}
                      {searchField === "text" && (
                        <>Make sure you entered <strong>quote text</strong> (e.g., "The only way"), not an author name.</>
                      )}
                      {searchField === "category" && (
                        <>Make sure you entered a <strong>category name</strong> (e.g., "motivation"), not quote text or author name.</>
                      )}
                      {searchField === "all" && (
                        <>Try a different search term or check your spelling.</>
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Browse Tab */}
          {activeTab === "browse" && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: "#000000", marginBottom: 4 }}>
                      Browse All Quotes
                    </h2>
                    {quotesPagination && (
                      <p style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>
                        Showing {allQuotes.length} of {quotesPagination.total} quotes
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setQuotesFilterAuthor("");
                      setQuotesFilterCategory("");
                      setQuotesFilterSearch("");
                      void fetchAllQuotes(1, 10, null, null, null);
                    }}
                    disabled={quotesLoading}
                    style={{
                      ...buttonStyles.base,
                      ...buttonStyles.secondary,
                      minWidth: 120,
                    }}
                  >
                    {quotesLoading ? "Loading..." : "🔄 Refresh"}
                  </button>
                </div>

                {/* Search Filter */}
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#e2e8f0",
                      marginBottom: 8,
                    }}
                  >
                    Search Quotes (All Fields)
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <input
                      type="text"
                      value={quotesFilterSearch}
                      onChange={(e) => setQuotesFilterSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          void fetchAllQuotes(1, 10, quotesFilterAuthor || null, quotesFilterCategory || null, quotesFilterSearch || null);
                        }
                      }}
                      placeholder={t("searchPlaceholderText", language)}
                      style={{
                        flex: 1,
                        minWidth: 200,
                        padding: "12px 16px",
                        borderRadius: 12,
                        border: "2px solid rgba(102, 126, 234, 0.25)",
                        fontSize: 15,
                        backgroundColor: "rgba(30, 41, 59, 0.8)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        outline: "none",
                        fontFamily: "'Inter', sans-serif",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        color: "#f1f5f9",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
                        border: "2px solid rgba(99, 102, 241, 0.3)",
                      }}
                    />
                    <button
                      onClick={() => void fetchAllQuotes(1, 10, quotesFilterAuthor || null, quotesFilterCategory || null, quotesFilterSearch || null)}
                      disabled={quotesLoading}
                      style={{
                        ...buttonStyles.base,
                        ...buttonStyles.primary,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        minWidth: 100,
                      }}
                    >
                      {quotesLoading ? (
                        "Loading..."
                      ) : (
                        <>
                          <span style={{ fontSize: "16px" }}>🔍</span>
                          <span>Search</span>
                        </>
                      )}
                    </button>
                    {quotesFilterSearch && (
                      <button
                        onClick={() => {
                          setQuotesFilterSearch("");
                          void fetchAllQuotes(1, 10, quotesFilterAuthor || null, quotesFilterCategory || null, null);
                        }}
                        disabled={quotesLoading}
                        style={{
                          ...buttonStyles.base,
                          ...buttonStyles.outline,
                          minWidth: 100,
                        }}
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                </div>

                {/* Author Filter */}
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#e2e8f0",
                      marginBottom: 8,
                    }}
                  >
                    Filter by Author
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <input
                      type="text"
                      value={quotesFilterAuthor}
                      onChange={(e) => setQuotesFilterAuthor(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          void fetchAllQuotes(1, 10, quotesFilterAuthor || null, quotesFilterCategory || null, quotesFilterSearch || null);
                        }
                      }}
                      placeholder={t("enterAuthorName", language)}
                      style={{
                        flex: 1,
                        minWidth: 200,
                        padding: "12px 16px",
                        borderRadius: 12,
                        border: "2px solid rgba(102, 126, 234, 0.25)",
                        fontSize: 15,
                        backgroundColor: "rgba(30, 41, 59, 0.8)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        outline: "none",
                        fontFamily: "'Inter', sans-serif",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        color: "#f1f5f9",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
                        border: "2px solid rgba(99, 102, 241, 0.3)",
                      }}
                    />
                    <button
                      onClick={() => void fetchAllQuotes(1, 10, quotesFilterAuthor || null, quotesFilterCategory || null, quotesFilterSearch || null)}
                      disabled={quotesLoading}
                      style={{
                        ...buttonStyles.base,
                        ...buttonStyles.primary,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        minWidth: 100,
                      }}
                    >
                      {quotesLoading ? (
                        "Loading..."
                      ) : (
                        <>
                          <span style={{ fontSize: "16px" }}>🔍</span>
                          <span>Filter</span>
                        </>
                      )}
                    </button>
                    {quotesFilterAuthor && (
                      <button
                        onClick={() => {
                          setQuotesFilterAuthor("");
                          void fetchAllQuotes(1, 10, null, quotesFilterCategory || null, quotesFilterSearch || null);
                        }}
                        disabled={quotesLoading}
                        style={{
                          ...buttonStyles.base,
                          ...buttonStyles.outline,
                          minWidth: 80,
                        }}
                      >
                        Clear Author
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filter */}
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#e2e8f0",
                      marginBottom: 8,
                    }}
                  >
                    Filter by Category
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <input
                      type="text"
                      value={quotesFilterCategory}
                      onChange={(e) => setQuotesFilterCategory(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          void fetchAllQuotes(1, 10, quotesFilterAuthor || null, quotesFilterCategory || null, quotesFilterSearch || null);
                        }
                      }}
                      placeholder={t("enterCategory", language)}
                      style={{
                        flex: 1,
                        minWidth: 200,
                        padding: "12px 16px",
                        borderRadius: 12,
                        border: "2px solid rgba(102, 126, 234, 0.25)",
                        fontSize: 15,
                        backgroundColor: "rgba(30, 41, 59, 0.8)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        outline: "none",
                        fontFamily: "'Inter', sans-serif",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        color: "#f1f5f9",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
                        border: "2px solid rgba(99, 102, 241, 0.3)",
                      }}
                    />
                    <button
                      onClick={() => void fetchAllQuotes(1, 10, quotesFilterAuthor || null, quotesFilterCategory || null, quotesFilterSearch || null)}
                      disabled={quotesLoading}
                      style={{
                        ...buttonStyles.base,
                        ...buttonStyles.primary,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        minWidth: 100,
                      }}
                    >
                      {quotesLoading ? (
                        "Loading..."
                      ) : (
                        <>
                          <span style={{ fontSize: "16px" }}>🔍</span>
                          <span>Filter</span>
                        </>
                      )}
                    </button>
                    {quotesFilterCategory && (
                      <button
                        onClick={() => {
                          setQuotesFilterCategory("");
                          void fetchAllQuotes(1, 10, quotesFilterAuthor || null, null, quotesFilterSearch || null);
                        }}
                        disabled={quotesLoading}
                        style={{
                          ...buttonStyles.base,
                          ...buttonStyles.outline,
                          minWidth: 80,
                        }}
                      >
                        Clear Category
                      </button>
                    )}
                  </div>
                </div>

                {/* Active Filters Display */}
                {Object.keys(quotesFilters).length > 0 && (
                  <div
                    style={{
                      backgroundColor: "rgba(102, 126, 234, 0.1)",
                      borderRadius: 12,
                      padding: "12px 16px",
                      marginBottom: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#667eea" }}>
                      Active Filters:
                    </span>
                    {quotesFilters.author && (
                      <span
                        style={{
                          fontSize: 13,
                          padding: "6px 12px",
                          borderRadius: 8,
                          backgroundColor: "rgba(102, 126, 234, 0.2)",
                          color: "#667eea",
                          fontWeight: 500,
                        }}
                      >
                        Author: {quotesFilters.author}
                      </span>
                    )}
                    {quotesFilters.category && (
                      <span
                        style={{
                          fontSize: 13,
                          padding: "6px 12px",
                          borderRadius: 8,
                          backgroundColor: "rgba(102, 126, 234, 0.2)",
                          color: "#667eea",
                          fontWeight: 500,
                        }}
                      >
                        Category: {quotesFilters.category}
                      </span>
                    )}
                    {quotesFilters.search && (
                      <span
                        style={{
                          fontSize: 13,
                          padding: "6px 12px",
                          borderRadius: 8,
                          backgroundColor: "rgba(102, 126, 234, 0.2)",
                          color: "#667eea",
                          fontWeight: 500,
                        }}
                      >
                        Search: {quotesFilters.search}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setQuotesFilterAuthor("");
                        setQuotesFilterCategory("");
                        setQuotesFilterSearch("");
                        void fetchAllQuotes(1, 10, null, null, null);
                      }}
                      style={{
                        fontSize: 12,
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid rgba(102, 126, 234, 0.3)",
                        backgroundColor: "rgba(99, 102, 241, 0.2)",
                        color: "#a78bfa",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {quotesLoading && (
                <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  Loading quotes...
                </p>
              )}

              {!quotesLoading && allQuotes.length > 0 && (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gap: 16,
                      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                      marginBottom: 24,
                    }}
                  >
                    {allQuotes.map((q) => (
                      <div
                        key={q.id}
                        onClick={() => {
                          const newQuote = { text: q.text, author: q.author };
                          setOriginalQuote(newQuote);
                          setQuote(newQuote);
                          setActiveTab("home");
                        }}
                        style={{
                          backgroundColor: "rgba(15, 23, 42, 0.6)",
                          backdropFilter: "blur(20px) saturate(180%)",
                          WebkitBackdropFilter: "blur(20px) saturate(180%)",
                          border: "2px solid rgba(99, 102, 241, 0.2)",
                          borderRadius: 16,
                          padding: "20px",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                          cursor: "pointer",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          border: "1px solid rgba(0, 0, 0, 0.05)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
                        }}
                      >
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "flex-start",
                          marginBottom: 12,
                        }}>
                          <span
                            style={{
                              fontSize: 11,
                              padding: "4px 8px",
                              borderRadius: 8,
                              backgroundColor: "rgba(102, 126, 234, 0.1)",
                              color: "#667eea",
                              fontWeight: 600,
                            }}
                          >
                            ID: {q.id}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              padding: "4px 10px",
                              borderRadius: 12,
                              backgroundColor: "rgba(17, 153, 142, 0.15)",
                              color: "#11998e",
                              textTransform: "capitalize",
                              fontWeight: 500,
                            }}
                          >
                            {q.category}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 15,
                            lineHeight: 1.7,
                            color: "#f1f5f9",
                            marginBottom: 12,
                            fontWeight: 500,
                          }}
                        >
                          "{q.text}"
                        </p>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            paddingTop: 12,
                            borderTop: "1px solid rgba(0, 0, 0, 0.05)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              color: "#94a3b8",
                              fontStyle: "italic",
                              fontWeight: 500,
                            }}
                          >
                            — {q.author}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {quotesPagination && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 16,
                        marginTop: 24,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <button
                        onClick={() => {
                          if (quotesPagination.hasPreviousPage) {
                            void fetchAllQuotes(quotesPage - 1, 10, quotesFilterAuthor || null, quotesFilterCategory || null, quotesFilterSearch || null);
                          }
                        }}
                          disabled={!quotesPagination.hasPreviousPage}
                          style={{
                            ...buttonStyles.base,
                            ...buttonStyles.outline,
                            minWidth: 100,
                            opacity: quotesPagination.hasPreviousPage ? 1 : 0.5,
                          }}
                        >
                          ← Previous
                        </button>
                        <div style={{ 
                          display: "flex", 
                          flexDirection: "column", 
                          alignItems: "center",
                          gap: 4,
                        }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#000000" }}>
                            Page {quotesPagination.page} of {quotesPagination.totalPages}
                          </span>
                          <span style={{ fontSize: 12, color: "#64748b" }}>
                            {quotesPagination.total} total quotes
                          </span>
                        </div>
                        <button
                        onClick={() => {
                          if (quotesPagination.hasNextPage) {
                            void fetchAllQuotes(quotesPage + 1, 10, quotesFilterAuthor || null, quotesFilterCategory || null, quotesFilterSearch || null);
                          }
                        }}
                          disabled={!quotesPagination.hasNextPage}
                          style={{
                            ...buttonStyles.base,
                            ...buttonStyles.outline,
                            minWidth: 100,
                            opacity: quotesPagination.hasNextPage ? 1 : 0.5,
                          }}
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!quotesLoading && allQuotes.length === 0 && (
                <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  {t("noQuotesFoundRefresh", language)}
                </p>
              )}
            </div>
          )}

          {/* Submit Tab */}
          {activeTab === "submit" && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24, color: "#000000" }}>
                Submit New Quote
              </h2>
              <form onSubmit={submitNewQuote}>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: 900,
                        color: "#e2e8f0",
                        marginBottom: 8,
                      }}
                    >
                      Quote Text *
                    </label>
                    <textarea
                      value={newQuoteText}
                      onChange={(e) => {
                        setNewQuoteText(e.target.value);
                        setSubmitError(null);
                      }}
                      placeholder={t("enterQuoteText", language)}
                      rows={4}
                      maxLength={500}
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: 12,
                        border: "1px solid rgba(148, 163, 184, 0.35)",
                        fontSize: 15,
                        fontFamily: "inherit",
                        backgroundColor: "rgba(30, 41, 59, 0.8)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        border: "2px solid rgba(99, 102, 241, 0.3)",
                        color: "#f1f5f9",
                        outline: "none",
                        resize: "vertical",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
                      }}
                    />
                    <p
                      style={{
                        fontSize: 12,
                        color: "#94a3b8",
                        marginTop: 6,
                        textAlign: "right",
                      }}
                    >
                      {newQuoteText.length}/500 characters
                    </p>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: 20,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 14,
                          fontWeight: 900,
                          color: "#e2e8f0",
                          marginBottom: 8,
                        }}
                      >
                        Author *
                      </label>
                      <input
                        type="text"
                        value={newQuoteAuthor}
                        onChange={(e) => {
                          setNewQuoteAuthor(e.target.value);
                          setSubmitError(null);
                        }}
                        placeholder={t("authorNamePlaceholder", language)}
                        maxLength={100}
                        style={{
                          width: "100%",
                          padding: "14px 18px",
                          borderRadius: 12,
                          border: "1px solid rgba(148, 163, 184, 0.35)",
                          fontSize: 15,
                          backgroundColor: "rgba(30, 41, 59, 0.8)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                          border: "2px solid rgba(99, 102, 241, 0.3)",
                          color: "#f1f5f9",
                          outline: "none",
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 14,
                          fontWeight: 900,
                          color: "#e2e8f0",
                          marginBottom: 8,
                        }}
                      >
                        Category
                      </label>
                      <select
                        value={newQuoteCategory}
                        onChange={(e) => {
                          setNewQuoteCategory(e.target.value);
                          setSubmitError(null);
                        }}
                        style={{
                          width: "100%",
                          padding: "14px 18px",
                          borderRadius: 12,
                          border: "1px solid rgba(148, 163, 184, 0.35)",
                          fontSize: 15,
                          backgroundColor: "rgba(30, 41, 59, 0.8)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                          border: "2px solid rgba(99, 102, 241, 0.3)",
                          color: "#f1f5f9",
                          cursor: "pointer",
                          outline: "none",
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        <option value="general">General</option>
                        <option value="motivation">Motivation</option>
                        <option value="wisdom">Wisdom</option>
                        <option value="perseverance">Perseverance</option>
                        <option value="success">Success</option>
                        <option value="leadership">Leadership</option>
                        <option value="inspiration">Inspiration</option>
                      </select>
                    </div>
                  </div>

                  {submitError && (
                    <p
                      style={{
                        fontSize: 13,
                        color: "#b45309",
                        backgroundColor: "rgba(248, 113, 113, 0.18)",
                        padding: "12px 16px",
                        borderRadius: 12,
                      }}
                    >
                      {submitError}
                    </p>
                  )}

                  {submitSuccess && submittedQuote && (
                    <div
                      style={{
                        fontSize: 14,
                        color: "#166534",
                        backgroundColor: "rgba(16, 185, 129, 0.15)",
                        padding: "16px 20px",
                        borderRadius: 14,
                        border: "1px solid rgba(16, 185, 129, 0.2)",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <div style={{ marginBottom: 12, fontWeight: 600, fontSize: 15 }}>
                        ✓ Quote submitted successfully!
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.6 }}>
                        <div style={{ marginBottom: 6 }}>
                          <strong>Quote ID:</strong> {submittedQuote.id}
                        </div>
                        <div style={{ marginBottom: 6 }}>
                          <strong>Text:</strong> "{submittedQuote.text}"
                        </div>
                        <div style={{ marginBottom: 6 }}>
                          <strong>Author:</strong> {submittedQuote.author}
                        </div>
                        <div style={{ marginBottom: 6 }}>
                          <strong>Category:</strong> <span style={{ textTransform: "capitalize" }}>{submittedQuote.category}</span>
                        </div>
                        {submittedQuote.createdAt && (
                          <div style={{ marginBottom: 4 }}>
                            <strong>Created At:</strong> {new Date(submittedQuote.createdAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8, fontStyle: "italic" }}>
                        Loading your quote...
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitLoading || !newQuoteText.trim() || !newQuoteAuthor.trim()}
                    style={{
                      ...buttonStyles.base,
                      ...buttonStyles.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      width: "100%",
                      opacity:
                        submitLoading || !newQuoteText.trim() || !newQuoteAuthor.trim()
                          ? 0.6
                          : 1,
                    }}
                  >
                    {submitLoading ? (
                      "Submitting..."
                    ) : (
                      <>
                        <span style={{ fontSize: "16px" }}>✍️</span>
                        <span>Submit Quote</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Authors Tab */}
          {activeTab === "authors" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#000000" }}>
                  All Authors
                </h2>
                <button
                  onClick={() => void fetchAuthors()}
                  disabled={authorsLoading}
                  style={{
                    ...buttonStyles.base,
                    ...buttonStyles.secondary,
                    minWidth: 120,
                  }}
                >
                  {authorsLoading ? "Loading..." : "🔄 Refresh"}
                </button>
              </div>

              {authorsError && (
                <p
                  style={{
                    fontSize: 13,
                    color: "#b45309",
                    backgroundColor: "rgba(248, 113, 113, 0.18)",
                    padding: "12px 16px",
                    borderRadius: 12,
                    marginBottom: 20,
                  }}
                >
                  {authorsError}
                </p>
              )}

              {authorsStats && (
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    marginBottom: 24,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "rgba(17, 153, 142, 0.1)",
                      borderRadius: 12,
                      padding: "16px 20px",
                      flex: 1,
                      minWidth: 150,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#11998e",
                        marginBottom: 4,
                      }}
                    >
                      {authorsStats.total}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#e2e8f0",
                      }}
                    >
                      Total Authors
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: "rgba(102, 126, 234, 0.1)",
                      borderRadius: 12,
                      padding: "16px 20px",
                      flex: 1,
                      minWidth: 150,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#667eea",
                        marginBottom: 4,
                      }}
                    >
                      {authorsStats.totalQuotes}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#e2e8f0",
                      }}
                    >
                      Total Quotes
                    </div>
                  </div>
                </div>
              )}

              {authorsLoading && (
                <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  Loading authors...
                </p>
              )}

              {!authorsLoading && authors.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gap: 16,
                    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  }}
                >
                  {authors.map((author) => (
                    <div
                      key={author.name}
                      style={{
                        backgroundColor: "rgba(15, 23, 42, 0.6)",
                        backdropFilter: "blur(20px) saturate(180%)",
                        WebkitBackdropFilter: "blur(20px) saturate(180%)",
                        border: "2px solid rgba(99, 102, 241, 0.2)",
                        borderRadius: 16,
                        padding: "20px",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 12,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 18,
                            fontWeight: 600,
                            color: "#f1f5f9",
                            margin: 0,
                          }}
                        >
                          {author.name}
                        </p>
                        <span
                          style={{
                            fontSize: 12,
                            padding: "6px 12px",
                            borderRadius: 12,
                            backgroundColor: "rgba(17, 153, 142, 0.15)",
                            color: "#11998e",
                            fontWeight: 600,
                          }}
                        >
                          {author.quoteCount} quote{author.quoteCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {author.categories && author.categories.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {author.categories.map((category) => (
                            <span
                              key={category}
                              style={{
                                fontSize: 11,
                                padding: "4px 10px",
                                borderRadius: 8,
                                backgroundColor: "rgba(148, 163, 184, 0.15)",
                                color: "#94a3b8",
                                textTransform: "capitalize",
                              }}
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!authorsLoading && authors.length === 0 && (
                <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  No authors found. Click "Refresh" to load authors.
                </p>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#000000" }}>
                  App Statistics
                </h2>
                <button
                  onClick={() => void fetchStats()}
                  disabled={statsLoading}
                  style={{
                    ...buttonStyles.base,
                    ...buttonStyles.secondary,
                    minWidth: 120,
                  }}
                >
                  {statsLoading ? "Loading..." : "🔄 Refresh"}
                </button>
              </div>

              {statsError && (
                <p
                  style={{
                    fontSize: 13,
                    color: "#b45309",
                    backgroundColor: "rgba(248, 113, 113, 0.18)",
                    padding: "12px 16px",
                    borderRadius: 12,
                    marginBottom: 20,
                  }}
                >
                  {statsError}
                </p>
              )}

              {statsLoading && (
                <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  Loading statistics...
                </p>
              )}

              {!statsLoading && stats && (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: 16,
                      marginBottom: 24,
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "rgba(15, 23, 42, 0.6)",
                        backdropFilter: "blur(20px) saturate(180%)",
                        WebkitBackdropFilter: "blur(20px) saturate(180%)",
                        border: "2px solid rgba(99, 102, 241, 0.2)",
                        borderRadius: 16,
                        padding: "24px",
                        textAlign: "center",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 36,
                          fontWeight: 700,
                          color: "#11998e",
                          margin: "0 0 8px 0",
                        }}
                      >
                        {stats.overview.totalQuotes}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 900, color: "#000000", margin: 0 }}>
                        Total Quotes
                      </p>
                    </div>
                    <div
                      style={{
                        backgroundColor: "rgba(15, 23, 42, 0.6)",
                        backdropFilter: "blur(20px) saturate(180%)",
                        WebkitBackdropFilter: "blur(20px) saturate(180%)",
                        border: "2px solid rgba(99, 102, 241, 0.2)",
                        borderRadius: 16,
                        padding: "24px",
                        textAlign: "center",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 36,
                          fontWeight: 700,
                          color: "#11998e",
                          margin: "0 0 8px 0",
                        }}
                      >
                        {stats.overview.totalAuthors}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 900, color: "#000000", margin: 0 }}>
                        Authors
                      </p>
                    </div>
                    <div
                      style={{
                        backgroundColor: "rgba(15, 23, 42, 0.6)",
                        backdropFilter: "blur(20px) saturate(180%)",
                        WebkitBackdropFilter: "blur(20px) saturate(180%)",
                        border: "2px solid rgba(99, 102, 241, 0.2)",
                        borderRadius: 16,
                        padding: "24px",
                        textAlign: "center",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 36,
                          fontWeight: 700,
                          color: "#11998e",
                          margin: "0 0 8px 0",
                        }}
                      >
                        {stats.overview.totalCategories}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 900, color: "#000000", margin: 0 }}>
                        Categories
                      </p>
                    </div>
                    <div
                      style={{
                        backgroundColor: "rgba(15, 23, 42, 0.6)",
                        backdropFilter: "blur(20px) saturate(180%)",
                        WebkitBackdropFilter: "blur(20px) saturate(180%)",
                        border: "2px solid rgba(99, 102, 241, 0.2)",
                        borderRadius: 16,
                        padding: "24px",
                        textAlign: "center",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 36,
                          fontWeight: 700,
                          color: "#11998e",
                          margin: "0 0 8px 0",
                        }}
                      >
                        {stats.overview.averageQuoteLength}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 900, color: "#000000", margin: 0 }}>
                        Avg Length
                      </p>
                    </div>
                    {stats.overview.averageWordsPerQuote !== undefined && (
                      <div
                        style={{
                          backgroundColor: "rgba(15, 23, 42, 0.6)",
                          backdropFilter: "blur(20px) saturate(180%)",
                          WebkitBackdropFilter: "blur(20px) saturate(180%)",
                          border: "2px solid rgba(99, 102, 241, 0.2)",
                          borderRadius: 16,
                          padding: "24px",
                          textAlign: "center",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 36,
                            fontWeight: 700,
                            color: "#818cf8",
                            margin: "0 0 8px 0",
                          }}
                        >
                          {stats.overview.averageWordsPerQuote}
                        </p>
                        <p style={{ fontSize: 13, fontWeight: 900, color: "#e2e8f0", margin: 0 }}>
                          Avg Words/Quote
                        </p>
                      </div>
                    )}
                    {stats.overview.totalWords !== undefined && (
                      <div
                        style={{
                          backgroundColor: "rgba(15, 23, 42, 0.6)",
                          backdropFilter: "blur(20px) saturate(180%)",
                          WebkitBackdropFilter: "blur(20px) saturate(180%)",
                          border: "2px solid rgba(99, 102, 241, 0.2)",
                          borderRadius: 16,
                          padding: "24px",
                          textAlign: "center",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 36,
                            fontWeight: 700,
                            color: "#fbbf24",
                            margin: "0 0 8px 0",
                          }}
                        >
                          {stats.overview.totalWords}
                        </p>
                        <p style={{ fontSize: 13, fontWeight: 900, color: "#e2e8f0", margin: 0 }}>
                          Total Words
                        </p>
                      </div>
                    )}
                  </div>

                  {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: "#e2e8f0",
                          marginBottom: 16,
                        }}
                      >
                        Category Breakdown
                      </h3>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                          gap: 12,
                        }}
                      >
                        {stats.categoryBreakdown.map((cat) => (
                          <div
                            key={cat.name}
                            style={{
                              backgroundColor: "rgba(15, 23, 42, 0.6)",
                              backdropFilter: "blur(20px) saturate(180%)",
                              WebkitBackdropFilter: "blur(20px) saturate(180%)",
                              border: "2px solid rgba(99, 102, 241, 0.2)",
                              borderRadius: 12,
                              padding: "16px",
                              display: "flex",
                              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                              justifyContent: "space-between",
                              alignItems: "center",
                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 14,
                                color: "#f1f5f9",
                                textTransform: "capitalize",
                              }}
                            >
                              {cat.name}
                            </span>
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#11998e",
                              }}
                            >
                              {cat.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {stats.quoteLengths && (
                    <div style={{ marginBottom: 24 }}>
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: "#e2e8f0",
                          marginBottom: 16,
                        }}
                      >
                        Quote Lengths
                      </h3>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                          gap: 16,
                        }}
                      >
                        {stats.quoteLengths.longest && (
                          <div
                            style={{
                              backgroundColor: "rgba(15, 23, 42, 0.6)",
                              backdropFilter: "blur(20px) saturate(180%)",
                              WebkitBackdropFilter: "blur(20px) saturate(180%)",
                              border: "2px solid rgba(99, 102, 241, 0.2)",
                              borderRadius: 12,
                              padding: "20px",
                              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#11998e",
                                marginBottom: 8,
                              }}
                            >
                              Longest Quote ({stats.quoteLengths.longest.length} chars)
                            </div>
                            <p
                              style={{
                                fontSize: 14,
                                color: "#f1f5f9",
                                lineHeight: 1.6,
                                marginBottom: 8,
                                fontStyle: "italic",
                              }}
                            >
                              "{stats.quoteLengths.longest.text}"
                            </p>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#94a3b8",
                              }}
                            >
                              ID: {stats.quoteLengths.longest.id}
                            </div>
                          </div>
                        )}
                        {stats.quoteLengths.shortest && (
                          <div
                            style={{
                              backgroundColor: "rgba(15, 23, 42, 0.6)",
                              backdropFilter: "blur(20px) saturate(180%)",
                              WebkitBackdropFilter: "blur(20px) saturate(180%)",
                              border: "2px solid rgba(99, 102, 241, 0.2)",
                              borderRadius: 12,
                              padding: "20px",
                              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                            }}
                          >
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#667eea",
                                marginBottom: 8,
                              }}
                            >
                              Shortest Quote ({stats.quoteLengths.shortest.length} chars)
                            </div>
                            <p
                              style={{
                                fontSize: 14,
                                color: "#f1f5f9",
                                lineHeight: 1.6,
                                marginBottom: 8,
                                fontStyle: "italic",
                              }}
                            >
                              "{stats.quoteLengths.shortest.text}"
                            </p>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#94a3b8",
                              }}
                            >
                              ID: {stats.quoteLengths.shortest.id}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {stats.topAuthors && stats.topAuthors.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: "#e2e8f0",
                          marginBottom: 16,
                        }}
                      >
                        Top Authors
                      </h3>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                          gap: 12,
                        }}
                      >
                        {stats.topAuthors.map((author, index) => (
                          <div
                            key={author.name}
                            style={{
                              backgroundColor: "rgba(15, 23, 42, 0.6)",
                              backdropFilter: "blur(20px) saturate(180%)",
                              WebkitBackdropFilter: "blur(20px) saturate(180%)",
                              border: "2px solid rgba(99, 102, 241, 0.2)",
                              borderRadius: 12,
                              padding: "16px",
                              display: "flex",
                              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                              justifyContent: "space-between",
                              alignItems: "center",
                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "#94a3b8",
                                }}
                              >
                                #{index + 1}
                              </span>
                              <span style={{ fontSize: 14, color: "#f1f5f9" }}>
                                {author.name}
                              </span>
                            </div>
                            <span
                              style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#11998e",
                              }}
                            >
                              {author.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(stats.authors || stats.categories) && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: 24,
                      }}
                    >
                      {stats.authors && stats.authors.length > 0 && (
                        <div>
                          <h3
                            style={{
                              fontSize: 18,
                              fontWeight: 900,
                              color: "#e2e8f0",
                              marginBottom: 16,
                            }}
                          >
                            All Authors ({stats.authors.length})
                          </h3>
                          <div
                            style={{
                              backgroundColor: "rgba(15, 23, 42, 0.6)",
                              backdropFilter: "blur(20px) saturate(180%)",
                              WebkitBackdropFilter: "blur(20px) saturate(180%)",
                              border: "2px solid rgba(99, 102, 241, 0.2)",
                              borderRadius: 12,
                              padding: "20px",
                              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 8,
                              }}
                            >
                              {stats.authors.map((author) => (
                                <span
                                  key={author}
                                  style={{
                                    fontSize: 13,
                                    padding: "6px 12px",
                                    borderRadius: 8,
                                    backgroundColor: "rgba(17, 153, 142, 0.1)",
                                    color: "#11998e",
                                    fontWeight: 500,
                                  }}
                                >
                                  {author}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {stats.categories && stats.categories.length > 0 && (
                        <div>
                          <h3
                            style={{
                              fontSize: 18,
                              fontWeight: 900,
                              color: "#e2e8f0",
                              marginBottom: 16,
                            }}
                          >
                            All Categories ({stats.categories.length})
                          </h3>
                          <div
                            style={{
                              backgroundColor: "rgba(15, 23, 42, 0.6)",
                              backdropFilter: "blur(20px) saturate(180%)",
                              WebkitBackdropFilter: "blur(20px) saturate(180%)",
                              border: "2px solid rgba(99, 102, 241, 0.2)",
                              borderRadius: 12,
                              padding: "20px",
                              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 8,
                              }}
                            >
                              {stats.categories.map((category) => (
                                <span
                                  key={category}
                                  style={{
                                    fontSize: 13,
                                    padding: "6px 12px",
                                    borderRadius: 8,
                                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                                    color: "#667eea",
                                    fontWeight: 500,
                                    textTransform: "capitalize",
                                  }}
                                >
                                  {category}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!statsLoading && !stats && (
                <p style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                  Click "Refresh" to load statistics.
                </p>
              )}
            </div>
          )}

          {/* Collections Tab */}
          {activeTab === "collections" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#e2e8f0" }}>
                  {t("myCollections", language)} ({collections.length})
                </h2>
                <button
                  onClick={() => {
                    setEditingCollection(null);
                    setCollectionName("");
                    setShowCollectionModal(true);
                  }}
                  style={{
                    ...buttonStyles.base,
                    ...buttonStyles.primary,
                    minWidth: 0,
                    padding: "10px 18px",
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>➕</span>
                  <span>{t("createCollection", language)}</span>
                </button>
              </div>

              {collections.length === 0 ? (
                <div
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "2px solid rgba(99, 102, 241, 0.2)",
                    borderRadius: 16,
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                    padding: "40px",
                    textAlign: "center",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <p style={{ fontSize: 16, color: "#64748b", marginBottom: 20 }}>
                    {t("noCollections", language)}
                  </p>
                  <button
                    onClick={() => {
                      setEditingCollection(null);
                      setCollectionName("");
                      setShowCollectionModal(true);
                    }}
                    style={{
                      ...buttonStyles.base,
                      ...buttonStyles.primary,
                      padding: "12px 24px",
                      fontSize: 14,
                    }}
                  >
                    {t("createCollection", language)}
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 16,
                  }}
                >
                  {collections.map((collection) => (
                    <div
                      key={collection.id}
                      style={{
                        backgroundColor: "rgba(15, 23, 42, 0.6)",
                        backdropFilter: "blur(20px) saturate(180%)",
                        WebkitBackdropFilter: "blur(20px) saturate(180%)",
                        border: "2px solid rgba(99, 102, 241, 0.2)",
                        borderRadius: 16,
                        padding: "20px",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        border: selectedCollection === collection.id ? "2px solid #11998e" : "2px solid transparent",
                      }}
                      onClick={() => setSelectedCollection(selectedCollection === collection.id ? null : collection.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.12)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.08)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 12,
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#e2e8f0",
                            flex: 1,
                            marginRight: 8,
                          }}
                        >
                          {collection.name}
                        </h3>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCollection(collection);
                              setCollectionName(collection.name);
                              setShowCollectionModal(true);
                            }}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              border: "none",
                              backgroundColor: "rgba(102, 126, 234, 0.1)",
                              color: "#667eea",
                              cursor: "pointer",
                              fontSize: 12,
                            }}
                          >
                            {t("edit", language)}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete collection "${collection.name}"?`)) {
                                deleteCollection(collection.id);
                              }
                            }}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              border: "none",
                              backgroundColor: "rgba(239, 68, 68, 0.1)",
                              color: "#ef4444",
                              cursor: "pointer",
                              fontSize: 12,
                            }}
                          >
                            {t("delete", language)}
                          </button>
                        </div>
                      </div>
                      <p style={{ fontSize: 14, color: "#64748b", marginBottom: 12 }}>
                        {collection.quotes.length} {t("quotesInCollection", language)}
                      </p>
                      {selectedCollection === collection.id && collection.quotes.length > 0 && (
                        <div
                          style={{
                            marginTop: 16,
                            paddingTop: 16,
                            borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                            maxHeight: "400px",
                            overflowY: "auto",
                          }}
                        >
                          {collection.quotes.map((q) => (
                            <div
                              key={q.id}
                              style={{
                                backgroundColor: "rgba(99, 102, 241, 0.2)",
                                borderRadius: 8,
                                padding: "12px",
                                marginBottom: 8,
                                border: "1px solid rgba(0, 0, 0, 0.05)",
                              }}
                            >
                              <p style={{ fontSize: 14, color: "#f1f5f9", marginBottom: 4, lineHeight: 1.5 }}>
                                "{q.text}"
                              </p>
                              <p style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
                                — {q.author}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeQuoteFromCollection(collection.id, q);
                                }}
                                style={{
                                  marginTop: 8,
                                  padding: "4px 8px",
                                  borderRadius: 6,
                                  border: "none",
                                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                                  color: "#ef4444",
                                  cursor: "pointer",
                                  fontSize: 11,
                                }}
                              >
                                {t("removeFromCollection", language)}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Collection Modal */}
              {showCollectionModal && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    padding: "20px",
                  }}
                  onClick={() => {
                    setShowCollectionModal(false);
                    setEditingCollection(null);
                    setCollectionName("");
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "rgba(15, 23, 42, 0.6)",
                      backdropFilter: "blur(20px) saturate(180%)",
                      WebkitBackdropFilter: "blur(20px) saturate(180%)",
                      border: "2px solid rgba(99, 102, 241, 0.2)",
                      borderRadius: 16,
                      padding: "24px",
                      maxWidth: 400,
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                      width: "100%",
                      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: "#000000" }}>
                      {editingCollection ? t("edit", language) : t("createCollection", language)}
                    </h3>
                    <input
                      type="text"
                      value={collectionName}
                      onChange={(e) => setCollectionName(e.target.value)}
                      placeholder={t("collectionName", language)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: 8,
                        border: "1px solid rgba(0, 0, 0, 0.2)",
                        fontSize: 14,
                        marginBottom: 16,
                        boxSizing: "border-box",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (editingCollection) {
                            editCollection(editingCollection.id, collectionName);
                          } else {
                            createCollection(collectionName);
                          }
                        }
                      }}
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                      <button
                        onClick={() => {
                          setShowCollectionModal(false);
                          setEditingCollection(null);
                          setCollectionName("");
                        }}
                        style={{
                          ...buttonStyles.base,
                          ...buttonStyles.outline,
                          padding: "10px 20px",
                        }}
                      >
                        {t("cancel", language)}
                      </button>
                      <button
                        onClick={() => {
                          if (editingCollection) {
                            editCollection(editingCollection.id, collectionName);
                          } else {
                            createCollection(collectionName);
                          }
                        }}
                        disabled={!collectionName.trim()}
                        style={{
                          ...buttonStyles.base,
                          ...buttonStyles.primary,
                          padding: "10px 20px",
                          opacity: !collectionName.trim() ? 0.6 : 1,
                        }}
                      >
                        {t("save", language)}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "#000000" }}>
                  My Favorites ({favorites.length})
                </h2>
                {favorites.length > 0 && (
                  <button
                    onClick={() => setFavorites([])}
                    style={{
                      ...buttonStyles.base,
                      ...buttonStyles.outline,
                      minWidth: 0,
                      padding: "10px 18px",
                      fontSize: 14,
                    }}
                  >
                    🗑️ Clear All
                  </button>
                )}
              </div>

              <input
                type="search"
                value={favoriteQuery}
                onChange={(event) => setFavoriteQuery(event.target.value)}
                placeholder={t("filterFavoritesPlaceholder", language)}
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  borderRadius: 12,
                  border: "1px solid rgba(148, 163, 184, 0.35)",
                  marginBottom: 20,
                  fontSize: 15,
                  backgroundColor: "rgba(30, 41, 59, 0.8)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "2px solid rgba(99, 102, 241, 0.3)",
                  color: "#f1f5f9",
                  outline: "none",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.05)",
                }}
              />

              {favorites.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#64748b",
                    fontSize: 16,
                  }}
                >
                  No favorites yet. Favo quotes from the Home tab to see them here!
                </p>
              ) : visibleFavorites.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#64748b",
                  }}
                >
                  No favorites matched your search. Try a different keyword.
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: 16,
                  }}
                >
                  {visibleFavorites.map((fav) => (
                    <div
                      key={fav.id}
                      style={{
                        backgroundColor: "rgba(15, 23, 42, 0.6)",
                        backdropFilter: "blur(20px) saturate(180%)",
                        WebkitBackdropFilter: "blur(20px) saturate(180%)",
                        border: "2px solid rgba(99, 102, 241, 0.2)",
                        borderRadius: 16,
                        padding: "20px",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 15,
                          lineHeight: 1.6,
                          color: "#f1f5f9",
                          minHeight: 60,
                        }}
                      >
                        {fav.text}
                      </p>
                      <span
                        style={{
                          fontSize: 13,
                          color: "#94a3b8",
                          fontStyle: "italic",
                        }}
                      >
                        — {fav.author}
                      </span>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          onClick={() => {
                            restoreQuote(fav);
                            setActiveTab("home");
                          }}
                          style={{
                            ...buttonStyles.base,
                            ...buttonStyles.outline,
                            minWidth: 0,
                            padding: "8px 16px",
                            fontSize: 13,
                          }}
                        >
                          👁️ View
                        </button>
                        <button
                          onClick={() => removeFavorite(fav.id)}
                          style={{
                            ...buttonStyles.base,
                            ...buttonStyles.outline,
                            minWidth: 0,
                            padding: "8px 16px",
                            fontSize: 13,
                          }}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24, color: "#000000" }}>
                {t("settings", language)}
              </h2>

              <div
                style={{
                  display: "grid",
                  gap: 24,
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                }}
              >
                <div
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "2px solid rgba(99, 102, 241, 0.2)",
                    borderRadius: 16,
                    padding: "24px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      marginBottom: 16,
                      color: "#e2e8f0",
                    }}
                  >
                    🎨 Theme & Appearance
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 900,
                      color: "#e2e8f0",
                      marginBottom: 16,
                    }}
                  >
                    Current palette: {paletteFriendlyName}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <button
                      onClick={toggleTheme}
                      style={{
                        ...buttonStyles.base,
                        ...buttonStyles.secondary,
                        width: "100%",
                      }}
                    >
                      {themeMode === "dark" ? "☀️ Switch to Light Theme" : "🌙 Switch to Dark Theme"}
                    </button>
                    <button
                      onClick={toggleThemeFixed}
                      style={{
                        ...buttonStyles.base,
                        ...buttonStyles.outline,
                        width: "100%",
                        backgroundColor: isThemeFixed ? "rgba(16, 185, 129, 0.1)" : "transparent",
                        borderColor: isThemeFixed ? "#10b981" : "rgba(102, 126, 234, 0.3)",
                        color: isThemeFixed ? "#10b981" : "#e2e8f0",
                      }}
                    >
                      {isThemeFixed ? "🔒 Theme Fixed" : "🔓 Fix Current Theme"}
                    </button>
                  </div>
                  {isThemeFixed && (
                    <p
                      style={{
                        fontSize: 12,
                        color: "#94a3b8",
                        marginTop: 12,
                        fontStyle: "italic",
                      }}
                    >
                      Theme is locked. Background won't change automatically.
                    </p>
                  )}
                </div>

                <div
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "2px solid rgba(99, 102, 241, 0.2)",
                    borderRadius: 16,
                    padding: "24px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      marginBottom: 16,
                      color: "#e2e8f0",
                    }}
                  >
                    ⏱️ Auto-Refresh
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 900, color: "#e2e8f0" }}>
                      {autoPlay ? `${t("active", language)} (${countdown}s)` : t("manualMode", language)}
                    </span>
                    <button
                      onClick={toggleAutoPlay}
                      style={{
                        ...buttonStyles.base,
                        ...buttonStyles.outline,
                        backgroundColor: autoPlay ? "#11998e" : "transparent",
                        color: autoPlay ? "white" : "#e2e8f0",
                        minWidth: 120,
                      }}
                    >
                      {autoPlay ? t("turnOff", language) : t("startAuto", language)}
                    </button>
                  </div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 900,
                      color: "#e2e8f0",
                      marginBottom: 8,
                    }}
                  >
                    Refresh every {autoPlaySeconds} seconds
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={autoPlaySeconds}
                    onChange={(event) =>
                      setAutoPlaySeconds(Number(event.target.value))
                    }
                    style={sliderTrackStyles}
                  />
                </div>

                <div
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.6)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    border: "2px solid rgba(99, 102, 241, 0.2)",
                    borderRadius: 16,
                    padding: "24px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 900,
                      marginBottom: 16,
                      color: "#e2e8f0",
                    }}
                  >
                    🔤 {t("readingComfort", language)}
                  </h3>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 900,
                      color: "#e2e8f0",
                      marginBottom: 12,
                    }}
                  >
                    {t("fontSize", language)}: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="16"
                    max="36"
                    step="1"
                    value={fontSize}
                    onChange={(event) => setFontSize(Number(event.target.value))}
                    style={sliderTrackStyles}
                  />
                  <button
                    onClick={() => setReadingMode((prev) => !prev)}
                    style={{
                      ...buttonStyles.base,
                      ...buttonStyles.outline,
                      backgroundColor: readingMode ? "#11998e" : "transparent",
                      color: readingMode ? "white" : "#e2e8f0",
                      width: "100%",
                      marginTop: 16,
                    }}
                  >
                    {readingMode ? t("disableFocusMode", language) : t("enableFocusMode", language)}
                  </button>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                  border: "2px solid rgba(99, 102, 241, 0.2)",
                  borderRadius: 16,
                  padding: "24px",
                  marginTop: 24,
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    marginBottom: 16,
                    color: "#000000",
                  }}
                >
                  🌐 {t("language", language)}
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {languagesLoading ? (
                    <div style={{ padding: "10px", color: "#64748b", fontSize: 14 }}>
                      {t("loading", language)}...
                    </div>
                  ) : (
                    availableLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        style={{
                          padding: "10px 16px",
                          borderRadius: 8,
                          border: language === lang.code ? "2px solid #11998e" : "1px solid rgba(148, 163, 184, 0.35)",
                          backgroundColor: language === lang.code ? "rgba(17, 153, 142, 0.15)" : "rgba(99, 102, 241, 0.15)",
                          color: language === lang.code ? "#10b981" : "#e2e8f0",
                          fontSize: 14,
                          fontWeight: language === lang.code ? 600 : 500,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          minWidth: "100px",
                          width: "auto",
                          textAlign: "center",
                        }}
                      >
                        {lang.nativeName}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "rgba(15, 23, 42, 0.6)",
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                  border: "2px solid rgba(99, 102, 241, 0.2)",
                  borderRadius: 16,
                  padding: "24px",
                  marginTop: 24,
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.1) inset",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    marginBottom: 12,
                    color: "#000000",
                  }}
                >
                  📊 App Info
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      padding: "8px 16px",
                      borderRadius: 12,
                      backgroundColor: "rgba(17, 153, 142, 0.15)",
                      color: "#11998e",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Quotes fetched: {fetchCount}
                  </span>
                  <span
                    style={{
                      padding: "8px 16px",
                      borderRadius: 12,
                      backgroundColor: "rgba(17, 153, 142, 0.15)",
                      color: "#11998e",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Favorites: {favorites.length}
                  </span>
                  <span
                    style={{
                      padding: "8px 16px",
                      borderRadius: 12,
                      backgroundColor: speechSupport
                        ? "rgba(134, 239, 172, 0.3)"
                        : "rgba(248, 113, 113, 0.18)",
                      color: speechSupport ? "#166534" : "#b45309",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {t("voice", language)}: {speechSupport ? t("ready", language) : t("notSupported", language)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <footer
            style={{
              fontSize: 13,
              color: "#475569",
              marginTop: 24,
              textAlign: "center",
              padding: "20px",
            }}
          >
            💡 Tip: Use the tabs above to navigate between different features. Enable auto-refresh in Settings for continuous inspiration!
          </footer>
          </div>
        </section>
      </main>
    </>
  );
}

