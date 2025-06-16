import { db } from "./db";
import { 
  employees,
  payrollConcepts,
  payrollPeriods,
  payrollDetails,
  payrollProjections
} from "../shared/hr-finance-integration";
import { parks, users, expenseCategories } from "../shared/schema";

/**
 * Script para crear datos de muestra para la integración HR-Finanzas
 */
export async function createHRFinanceIntegration() {
  console.log('🏢 Inicializando integración HR-Finanzas...');

  try {
    // 1. Crear empleados de muestra
    const employeesData = [
      {
        employeeCode: 'EMP001',
        fullName: 'María García López',
        email: 'maria.garcia@parques.mx',
        phone: '555-0101',
        position: 'Coordinadora de Parques',
        department: 'Operaciones',
        hireDate: '2023-01-15',
        baseSalary: '25000.00',
        salaryType: 'monthly',
        status: 'active',
        contractType: 'permanent',
        workSchedule: 'full_time',
        address: 'Av. Insurgentes 123, CDMX',
        emergencyContact: 'Juan García',
        emergencyPhone: '555-0102',
        education: 'Licenciatura en Administración Pública',
        skills: '["gestión de equipos", "planificación urbana", "administración"]'
      },
      {
        employeeCode: 'EMP002',
        fullName: 'Carlos Rodríguez Sánchez',
        email: 'carlos.rodriguez@parques.mx',
        phone: '555-0201',
        position: 'Jardinero Senior',
        department: 'Mantenimiento',
        hireDate: '2022-06-01',
        baseSalary: '18000.00',
        salaryType: 'monthly',
        status: 'active',
        contractType: 'permanent',
        workSchedule: 'full_time',
        address: 'Col. Roma Norte, CDMX',
        emergencyContact: 'Ana Rodríguez',
        emergencyPhone: '555-0202',
        education: 'Técnico en Jardinería',
        skills: '["mantenimiento de jardines", "poda de árboles", "sistemas de riego"]'
      },
      {
        employeeCode: 'EMP003',
        fullName: 'Ana Martínez Pérez',
        email: 'ana.martinez@parques.mx',
        phone: '555-0301',
        position: 'Instructora de Actividades',
        department: 'Programas Sociales',
        hireDate: '2023-03-10',
        baseSalary: '22000.00',
        salaryType: 'monthly',
        status: 'active',
        contractType: 'permanent',
        workSchedule: 'part_time',
        address: 'Col. Condesa, CDMX',
        emergencyContact: 'Luis Martínez',
        emergencyPhone: '555-0302',
        education: 'Licenciatura en Educación Física',
        skills: '["actividades deportivas", "programas sociales", "trabajo con niños"]'
      },
      {
        employeeCode: 'EMP004',
        fullName: 'Roberto Hernández Luna',
        email: 'roberto.hernandez@parques.mx',
        phone: '555-0401',
        position: 'Supervisor de Seguridad',
        department: 'Seguridad',
        hireDate: '2021-09-15',
        baseSalary: '20000.00',
        salaryType: 'monthly',
        status: 'active',
        contractType: 'permanent',
        workSchedule: 'full_time',
        address: 'Col. Doctores, CDMX',
        emergencyContact: 'Carmen Hernández',
        emergencyPhone: '555-0402',
        education: 'Técnico en Seguridad',
        skills: '["seguridad pública", "protocolos de emergencia", "vigilancia"]'
      },
      {
        employeeCode: 'EMP005',
        fullName: 'Laura Jiménez Torres',
        email: 'laura.jimenez@parques.mx',
        phone: '555-0501',
        position: 'Contadora',
        department: 'Finanzas',
        hireDate: '2022-01-20',
        baseSalary: '28000.00',
        salaryType: 'monthly',
        status: 'active',
        contractType: 'permanent',
        workSchedule: 'full_time',
        address: 'Col. Polanco, CDMX',
        emergencyContact: 'Miguel Jiménez',
        emergencyPhone: '555-0502',
        education: 'Licenciatura en Contaduría Pública',
        skills: '["contabilidad", "finanzas públicas", "auditoría"]'
      }
    ];

    console.log('📝 Creando empleados...');
    const createdEmployees = [];
    for (const empData of employeesData) {
      const [employee] = await db.insert(employees).values(empData).returning();
      createdEmployees.push(employee);
      console.log(`✅ Empleado creado: ${employee.fullName} (${employee.employeeCode})`);
    }

    // 2. Crear conceptos de nómina
    const payrollConceptsData = [
      {
        code: 'SUELDO_BASE',
        name: 'Sueldo Base',
        type: 'income',
        category: 'salary',
        isFixed: true,
        sortOrder: 1
      },
      {
        code: 'HORAS_EXTRA',
        name: 'Horas Extras',
        type: 'income',
        category: 'overtime',
        isFixed: false,
        formula: 'baseSalary / 160 * 1.5 * hours',
        sortOrder: 2
      },
      {
        code: 'BONO_PUNTUALIDAD',
        name: 'Bono de Puntualidad',
        type: 'income',
        category: 'bonus',
        isFixed: true,
        sortOrder: 3
      },
      {
        code: 'ISR',
        name: 'Impuesto Sobre la Renta',
        type: 'deduction',
        category: 'tax',
        isFixed: false,
        formula: 'baseSalary * 0.16',
        sortOrder: 4
      },
      {
        code: 'IMSS',
        name: 'Seguro Social',
        type: 'deduction',
        category: 'insurance',
        isFixed: false,
        formula: 'baseSalary * 0.04',
        sortOrder: 5
      },
      {
        code: 'INFONAVIT',
        name: 'INFONAVIT',
        type: 'deduction',
        category: 'insurance',
        isFixed: false,
        formula: 'baseSalary * 0.05',
        sortOrder: 6
      }
    ];

    console.log('💰 Creando conceptos de nómina...');
    const createdConcepts = [];
    for (const conceptData of payrollConceptsData) {
      const [concept] = await db.insert(payrollConcepts).values(conceptData).returning();
      createdConcepts.push(concept);
      console.log(`✅ Concepto creado: ${concept.name} (${concept.code})`);
    }

    // 3. Crear período de nómina de ejemplo
    const periodData = {
      name: 'Diciembre 2024',
      periodType: 'monthly',
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      payDate: '2024-12-31',
      status: 'draft'
    };

    console.log('📅 Creando período de nómina...');
    const [period] = await db.insert(payrollPeriods).values(periodData).returning();
    console.log(`✅ Período creado: ${period.name}`);

    // 4. Crear detalles de nómina de ejemplo
    console.log('📊 Creando detalles de nómina...');
    let totalGross = 0;
    let totalDeductions = 0;

    for (const employee of createdEmployees) {
      for (const concept of createdConcepts) {
        let amount = 0;

        // Calcular montos según el concepto
        if (concept.code === 'SUELDO_BASE') {
          amount = parseFloat(employee.baseSalary);
          totalGross += amount;
        } else if (concept.code === 'BONO_PUNTUALIDAD') {
          amount = 500; // Bono fijo
          totalGross += amount;
        } else if (concept.code === 'ISR') {
          amount = parseFloat(employee.baseSalary) * 0.16;
          totalDeductions += amount;
        } else if (concept.code === 'IMSS') {
          amount = parseFloat(employee.baseSalary) * 0.04;
          totalDeductions += amount;
        } else if (concept.code === 'INFONAVIT') {
          amount = parseFloat(employee.baseSalary) * 0.05;
          totalDeductions += amount;
        }

        if (amount > 0) {
          await db.insert(payrollDetails).values({
            payrollPeriodId: period.id,
            employeeId: employee.id,
            conceptId: concept.id,
            amount: amount.toString(),
            hours: concept.code === 'HORAS_EXTRA' ? '0' : null,
            rate: concept.code === 'HORAS_EXTRA' ? '0' : null,
          });
        }
      }
    }

    // Actualizar totales del período
    const totalNet = totalGross - totalDeductions;
    await db
      .update(payrollPeriods)
      .set({
        totalGross: totalGross.toString(),
        totalDeductions: totalDeductions.toString(),
        totalNet: totalNet.toString(),
        status: 'calculated'
      })
      .where(db.eq(payrollPeriods.id, period.id));

    console.log(`💼 Nómina calculada: 
    - Total Bruto: $${totalGross.toLocaleString('es-MX')}
    - Total Deducciones: $${totalDeductions.toLocaleString('es-MX')}
    - Total Neto: $${totalNet.toLocaleString('es-MX')}`);

    console.log('✅ Integración HR-Finanzas inicializada correctamente');
    
    return {
      employees: createdEmployees,
      concepts: createdConcepts,
      period: period,
      totals: { totalGross, totalDeductions, totalNet }
    };

  } catch (error) {
    console.error('❌ Error inicializando integración HR-Finanzas:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createHRFinanceIntegration()
    .then(() => {
      console.log('🎉 Integración HR-Finanzas completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}