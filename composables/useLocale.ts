import { ref } from 'vue'


const en = {
  'app.name':    'Open Data Modeler',
  'app.tagline': 'MERISE',
  'home.headline':    'Design your data models visually',
  'home.sub':         'Create Conceptual and Logical Data Models using the Merise methodology. Drag, link, and export.',
  'home.newMcd':      'New CDM / LDM',
  'home.newMcdSub':   'Start a blank Conceptual Data Model',
  'home.docsTitle':   'Documentation',
  'home.docsSub':     'Learn how to use Open Data Modeler',
  'home.aboutTitle':  'About Merise',
  'home.aboutSub':    'Understand CDM, LDM and cardinalities',
  'home.badge':       'Free & open source',
  'home.version':     'v1.0',
  'home.recent':      'Recent diagrams',
  'home.noRecent':    'No saved diagrams yet.',
  'home.open':        'Open',
  'home.delete':      'Delete',
  'home.rename':      'Rename',
  'home.newProject':  'New diagram',
  'mode.mcd.label': 'CDM',
  'mode.mld.label': 'LDM',
  'tools.select.label':  'Select',
  'tools.entity.label':  'Entity',
  'tools.assoc.label':   'Association',
  'tools.connect.label': 'Link',
  'tools.delete.label':  'Delete',
  'header.editModeOn':    'Edit',
  'header.editModeOff':   'View',
  'header.editModeTitle': 'Toggle edit mode',
  'header.typesOn':       'Types on',
  'header.typesOff':      'Types off',
  'header.showTypesTitle':'Toggle attribute types',
  'header.autoLayout':    'Auto-layout',
  'header.snap':          'Snap',
  'header.share':         'Share',
  'header.home':          'Home',
  'header.export':        'Export',
  'header.exportJson':    'Export JSON',
  'header.exportJsonSub': 'Save diagram as JSON',
  'header.importJson':    'Import JSON',
  'header.importJsonSub': 'Load a JSON diagram',
  'header.exportPng':     'Export PNG',
  'header.exportPngSub':  'High-res PNG image',
  'header.exportPdf':     'Export PDF',
  'header.exportPdfSub':  'PDF document',
  'header.exportSql':     'Export SQL',
  'header.exportSqlSub':  'Generate DDL script',
  'header.connectHintEntity': 'Click on an association',
  'header.connectHintAssoc':  'Click on an entity',
  'header.entities':      '{count} entities',
  'header.assocs':        '{count} assoc.',
  'sidebar.entityTitle': 'ENTITY',
  'sidebar.assocTitle':  'ASSOCIATION',
  'entity.nameLabel':    'Entity name',
  'entity.color':        'Header color',
  'entity.attrsLabel':   'Attributes',
  'entity.primaryKey':   'Primary key',
  'entity.addAttr':      'Add attribute',
  'entity.deleteEntity': 'Delete entity',
  'entity.defaultAttr':  'attribute',
  'assoc.nameLabel':   'Association name',
  'assoc.cardLabel':   'Cardinalities',
  'assoc.cardHint':    'Use the "Link" tool to connect entities.',
  'assoc.attrsLabel':  'Attributes',
  'assoc.addAttr':     'Add attribute',
  'assoc.deleteAssoc': 'Delete association',
  'assoc.defaultAttr': 'attribute',
  'mld.colName':    'Column name',
  'mld.colType':    'Column type',
  'mld.colRole':    'Key role',
  'mld.clearRole':  'Clear PK / FK',
  'mld.fkRef':      'References table',
  'mld.fkRefNone':  'None',
  'mld.fkRefPoints':'Points to',
  'mld.pkInfo':     'Uniquely identifies each row',
  'mld.fkInfo':     'References a row in another table',
  'mld.noRole':     'Regular column',
  'mld.syncFromCDM': 'Sync from CDM',
  'mld.emptySub':    'Click "Sync from CDM" to generate tables from your conceptual model.',
  'mld.syncWarning': 'This will overwrite your current LDM. Continue?',
  'mld.back':           'Back to CDM',
  'mld.pkLegend':       'Primary key',
  'mld.fkLegend':       'Foreign key',
  'mld.junctionLegend': 'Junction table',
  'mld.empty':          'No entities in the CDM.',
  'mld.junction':       'JUNCTION',
  'mld.editMode':       'Editable',
  'mld.viewMode':       'Read-only',
  'mld.resetOverrides': 'Reset edits',
  'canvas.emptyHint':     'Select "Entity" then click on the canvas',
  'canvas.emptyHintView': 'Enable Edit mode to add entities',
  'canvas.addFirstEntity':'Add first entity',
  'lang.switchTo':    'FR',
  'lang.switchLabel': 'Passer en français',
  'copied':           'Copied!',
  'copy':             'Copy',
  'toast.imported':   'Diagram imported',
  'share.desc':       'Share this link to open the diagram in a browser.',
} as const

const fr: typeof en = {
  'app.name':    'Open Data Modeler',
  'app.tagline': 'MERISE',
  'home.headline':    'Modélisez vos données visuellement',
  'home.sub':         'Créez des Modèles Conceptuels et Logiques de Données selon la méthode Merise. Glissez, liez, exportez.',
  'home.newMcd':      'Nouveau MCD / MLD',
  'home.newMcdSub':   'Démarrer un Modèle Conceptuel de Données vierge',
  'home.docsTitle':   'Documentation',
  'home.docsSub':     'Apprendre à utiliser Open Data Modeler',
  'home.aboutTitle':  'À propos de Merise',
  'home.aboutSub':    'Comprendre MCD, MLD et cardinalités',
  'home.badge':       'Gratuit & open source',
  'home.version':     'v1.0',
  'home.recent':      'Diagrammes récents',
  'home.noRecent':    'Aucun diagramme sauvegardé.',
  'home.open':        'Ouvrir',
  'home.delete':      'Supprimer',
  'home.rename':      'Renommer',
  'home.newProject':  'Nouveau diagramme',
  'mode.mcd.label': 'MCD',
  'mode.mld.label': 'MLD',
  'tools.select.label':  'Sélectionner',
  'tools.entity.label':  'Entité',
  'tools.assoc.label':   'Association',
  'tools.connect.label': 'Lier',
  'tools.delete.label':  'Supprimer',
  'header.editModeOn':    'Édition',
  'header.editModeOff':   'Lecture',
  'header.editModeTitle': 'Activer le mode édition',
  'header.typesOn':       'Types visibles',
  'header.typesOff':      'Types cachés',
  'header.showTypesTitle':'Afficher / masquer les types',
  'header.autoLayout':    'Auto-disposition',
  'header.snap':          'Grille',
  'header.share':         'Partager',
  'header.home':          'Accueil',
  'header.export':        'Exporter',
  'header.exportJson':    'Exporter JSON',
  'header.exportJsonSub': 'Sauvegarder en JSON',
  'header.importJson':    'Importer JSON',
  'header.importJsonSub': 'Charger un fichier JSON',
  'header.exportPng':     'Exporter PNG',
  'header.exportPngSub':  'Image PNG haute résolution',
  'header.exportPdf':     'Exporter PDF',
  'header.exportPdfSub':  'Document PDF',
  'header.exportSql':     'Exporter SQL',
  'header.exportSqlSub':  'Générer le script DDL',
  'header.connectHintEntity': 'Cliquer sur une association',
  'header.connectHintAssoc':  'Cliquer sur une entité',
  'header.entities':      '{count} entités',
  'header.assocs':        '{count} assoc.',
  'sidebar.entityTitle': 'ENTITÉ',
  'sidebar.assocTitle':  'ASSOCIATION',
  'entity.nameLabel':    "Nom de l'entité",
  'entity.color':        "Couleur de l'en-tête",
  'entity.attrsLabel':   'Attributs',
  'entity.primaryKey':   'Clé primaire',
  'entity.addAttr':      'Ajouter attribut',
  'entity.deleteEntity': "Supprimer l'entité",
  'entity.defaultAttr':  'attribut',
  'assoc.nameLabel':   "Nom de l'association",
  'assoc.cardLabel':   'Cardinalités',
  'assoc.cardHint':    "Utilisez l'outil « Lier » pour connecter des entités.",
  'assoc.attrsLabel':  'Attributs',
  'assoc.addAttr':     'Ajouter attribut',
  'assoc.deleteAssoc': "Supprimer l'association",
  'assoc.defaultAttr': 'attribut',
  'mld.colName':    'Nom de la colonne',
  'mld.colType':    'Type de la colonne',
  'mld.colRole':    'Rôle de clé',
  'mld.clearRole':  'Effacer PK / FK',
  'mld.fkRef':      'Table référencée',
  'mld.fkRefNone':  'Aucune',
  'mld.fkRefPoints':'Pointe vers',
  'mld.pkInfo':     'Identifie chaque ligne de manière unique',
  'mld.fkInfo':     'Référence une ligne d\'une autre table',
  'mld.noRole':     'Colonne standard',
  'mld.syncFromCDM': 'Synchroniser depuis MCD',
  'mld.emptySub':    'Cliquez sur « Synchroniser depuis MCD » pour générer les tables depuis votre modèle conceptuel.',
  'mld.syncWarning': 'Cela écrasera votre MLD actuel. Continuer ?',
  'mld.back':           'Retour MCD',
  'mld.pkLegend':       'Clé primaire',
  'mld.fkLegend':       'Clé étrangère',
  'mld.junctionLegend': 'Table de jonction',
  'mld.empty':          'Aucune entité dans le MCD.',
  'mld.junction':       'JONCTION',
  'mld.editMode':       'Éditable',
  'mld.viewMode':       'Lecture seule',
  'mld.resetOverrides': 'Réinitialiser',
  'canvas.emptyHint':     'Sélectionnez « Entité » puis cliquez sur le canvas',
  'canvas.emptyHintView': 'Activez le mode Édition pour ajouter des entités',
  'canvas.addFirstEntity':'Ajouter la première entité',
  'lang.switchTo':    'EN',
  'lang.switchLabel': 'Switch to English',
  'copied':           'Copié !',
  'copy':             'Copier',
  'toast.imported':   'Diagramme importé',
  'share.desc':       'Partagez ce lien pour ouvrir le diagramme dans un navigateur.',
}

const catalogs = { en, fr } as const
type Locale = keyof typeof catalogs
type MsgKey = keyof typeof en

// Module-level singleton — shared across all component instances in Nuxt 3
let _locale: ReturnType<typeof ref<Locale>> | null = null

function getLocale() {
  if (!_locale) _locale = ref<Locale>('en')
  return _locale
}

export function useLocale() {
  const locale = getLocale()

  // Restore from localStorage once on client
  if (import.meta.client && locale.value === 'en') {
    try {
      const saved = localStorage.getItem('odm_locale') as Locale | null
      if (saved && saved in catalogs) locale.value = saved
    } catch { /* ignore */ }
  }

  function t(key: MsgKey, params?: Record<string, string | number>): string {
    let str: string = (catalogs[locale.value] as Record<string, string>)[key]
      ?? (catalogs.en as Record<string, string>)[key]
      ?? key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(`{${k}}`, String(v))
      }
    }
    return str
  }

  function setLocale(l: Locale) {
    locale.value = l
    if (import.meta.client) {
      try { localStorage.setItem('odm_locale', l) } catch { /* ignore */ }
      document.documentElement.lang = l
    }
  }

  return { locale, t, setLocale }
}
