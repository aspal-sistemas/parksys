import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar traducciones directamente
const resources = {
  es: {
    common: {
      navigation: {
        dashboard: "Panel de Control",
        parks: "Parques",
        users: "Usuarios",
        volunteers: "Voluntarios",
        instructors: "Instructores",
        activities: "Actividades",
        assets: "Activos",
        finance: "Finanzas",
        trees: "Arbolado",
        concessions: "Concesiones",
        incidents: "Incidencias",
        events: "Eventos",
        reports: "Reportes",
        settings: "Configuración",
        amenities: "Amenidades",
        permissions: "Permisos",
        management: "Gestión",
        operativeSummary: "Resumen Operativo",
        inventory: "Inventario",
        map: "Mapa",
        maintenance: "Mantenimiento",
        assignments: "Asignaciones",
        categories: "Categorías",
        listing: "Listado",
        registration: "Registro",
        evaluation: "Evaluación",
        budgets: "Presupuestos",
        cashFlow: "Flujo de Efectivo",
        contracts: "Contratos",
        payments: "Pagos",
        species: "Especies",
        schedule: "Programación",
        participants: "Participantes"
      },
      actions: {
        save: "Guardar",
        cancel: "Cancelar",
        edit: "Editar",
        delete: "Eliminar",
        view: "Ver",
        add: "Agregar",
        create: "Crear",
        update: "Actualizar",
        search: "Buscar",
        filter: "Filtrar",
        export: "Exportar",
        loading: "Cargando...",
        error: "Error",
        success: "Éxito",
        confirm: "Confirmar",
        yes: "Sí",
        no: "No",
        close: "Cerrar",
        submit: "Enviar"
      }
    },
    parks: {
      title: "Gestión de Parques",
      subtitle: "Sistema integral de administración de parques municipales"
    },
    finance: {
      title: "Gestión Financiera",
      subtitle: "Control integral de finanzas municipales"
    },
    users: {
      title: "Gestión de Usuarios",
      subtitle: "Administración de personal y usuarios del sistema"
    }
  },
  en: {
    common: {
      navigation: {
        dashboard: "Dashboard",
        parks: "Parks",
        users: "Users",
        volunteers: "Volunteers",
        instructors: "Instructors",
        activities: "Activities",
        assets: "Assets",
        finance: "Finance",
        trees: "Trees",
        concessions: "Concessions",
        incidents: "Incidents",
        events: "Events",
        reports: "Reports",
        settings: "Settings",
        amenities: "Amenities",
        permissions: "Permissions",
        management: "Management",
        operativeSummary: "Operative Summary",
        inventory: "Inventory",
        map: "Map",
        maintenance: "Maintenance",
        assignments: "Assignments",
        categories: "Categories",
        listing: "Listing",
        registration: "Registration",
        evaluation: "Evaluation",
        budgets: "Budgets",
        cashFlow: "Cash Flow",
        contracts: "Contracts",
        payments: "Payments",
        species: "Species",
        schedule: "Schedule",
        participants: "Participants"
      },
      actions: {
        save: "Save",
        cancel: "Cancel",
        edit: "Edit",
        delete: "Delete",
        view: "View",
        add: "Add",
        create: "Create",
        update: "Update",
        search: "Search",
        filter: "Filter",
        export: "Export",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        confirm: "Confirm",
        yes: "Yes",
        no: "No",
        close: "Close",
        submit: "Submit"
      }
    },
    parks: {
      title: "Parks Management",
      subtitle: "Comprehensive municipal parks administration system"
    },
    finance: {
      title: "Financial Management",
      subtitle: "Comprehensive municipal finance control"
    },
    users: {
      title: "User Management",
      subtitle: "System personnel and user administration"
    }
  },
  pt: {
    common: {
      navigation: {
        dashboard: "Painel de Controle",
        parks: "Parques",
        users: "Usuários",
        volunteers: "Voluntários",
        instructors: "Instrutores",
        activities: "Atividades",
        assets: "Ativos",
        finance: "Finanças",
        trees: "Arborização",
        concessions: "Concessões",
        incidents: "Incidentes",
        events: "Eventos",
        reports: "Relatórios",
        settings: "Configurações",
        amenities: "Comodidades",
        permissions: "Permissões",
        management: "Gestão",
        operativeSummary: "Resumo Operacional",
        inventory: "Inventário",
        map: "Mapa",
        maintenance: "Manutenção",
        assignments: "Atribuições",
        categories: "Categorias",
        listing: "Listagem",
        registration: "Cadastro",
        evaluation: "Avaliação",
        budgets: "Orçamentos",
        cashFlow: "Fluxo de Caixa",
        contracts: "Contratos",
        payments: "Pagamentos",
        species: "Espécies",
        schedule: "Programação",
        participants: "Participantes"
      },
      actions: {
        save: "Salvar",
        cancel: "Cancelar",
        edit: "Editar",
        delete: "Excluir",
        view: "Visualizar",
        add: "Adicionar",
        create: "Criar",
        update: "Atualizar",
        search: "Buscar",
        filter: "Filtrar",
        export: "Exportar",
        loading: "Carregando...",
        error: "Erro",
        success: "Sucesso",
        confirm: "Confirmar",
        yes: "Sim",
        no: "Não",
        close: "Fechar",
        submit: "Enviar"
      }
    },
    parks: {
      title: "Gestão de Parques",
      subtitle: "Sistema abrangente de administração de parques municipais"
    },
    finance: {
      title: "Gestão Financeira",
      subtitle: "Controle abrangente de finanças municipais"
    },
    users: {
      title: "Gestão de Usuários",
      subtitle: "Administração de pessoal e usuários do sistema"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    lng: 'es',
    debug: false,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    defaultNS: 'common',
    ns: ['common', 'parks', 'users', 'finance'],
    
    supportedLngs: ['es', 'en', 'pt']
  });

export default i18n;