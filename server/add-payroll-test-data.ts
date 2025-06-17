import { db } from './db';
import { payrollPeriods, payrollDetails, payrollConcepts } from '../shared/schema';

/**
 * Script para agregar datos de prueba de nómina con períodos quincenales
 */
export async function addPayrollTestData() {
  try {
    console.log('Agregando datos de prueba de nómina...');

    // Crear períodos de nómina para 2025 (quincenales)
    const testPeriods = [
      {
        period: '2025-01-Q1', // Primera quincena enero
        startDate: '2025-01-01',
        endDate: '2025-01-15',
        status: 'paid' as const,
        processedAt: new Date('2025-01-15'),
        totalAmount: '45000.00',
        employeesCount: 3
      },
      {
        period: '2025-01-Q2', // Segunda quincena enero
        startDate: '2025-01-16', 
        endDate: '2025-01-31',
        status: 'paid' as const,
        processedAt: new Date('2025-01-31'),
        totalAmount: '45000.00',
        employeesCount: 3
      },
      {
        period: '2025-02-Q1', // Primera quincena febrero
        startDate: '2025-02-01',
        endDate: '2025-02-15',
        status: 'paid' as const,
        processedAt: new Date('2025-02-15'),
        totalAmount: '45000.00',
        employeesCount: 3
      }
    ];

    // Insertar períodos
    const insertedPeriods = await db.insert(payrollPeriods).values(testPeriods).returning();
    console.log(`Períodos insertados: ${insertedPeriods.length}`);

    // Obtener conceptos existentes
    const concepts = await db.select().from(payrollConcepts).limit(6);
    if (concepts.length === 0) {
      console.log('No hay conceptos de nómina. Creando conceptos básicos...');
      
      const basicConcepts = [
        {
          code: 'SALARIO',
          name: 'Salario Base',
          type: 'income' as const,
          category: 'salary' as const,
          isFixed: true,
          formula: 'base_salary / 2', // Quincena es la mitad del salario mensual
          isActive: true,
          expenseCategoryId: 1,
          sortOrder: 1
        },
        {
          code: 'IMSS',
          name: 'Descuento IMSS',
          type: 'deduction' as const,
          category: 'tax' as const,
          isFixed: true,
          formula: 'salary * 0.02375',
          isActive: true,
          expenseCategoryId: 2,
          sortOrder: 2
        }
      ];

      const insertedConcepts = await db.insert(payrollConcepts).values(basicConcepts).returning();
      console.log(`Conceptos básicos creados: ${insertedConcepts.length}`);
    }

    // Obtener conceptos actualizados
    const allConcepts = await db.select().from(payrollConcepts);
    
    // Crear detalles de nómina para empleado 18
    const employeeId = 18;
    const payrollDetailsList = [];

    for (const period of insertedPeriods) {
      for (const concept of allConcepts.slice(0, 2)) { // Solo usar 2 conceptos
        payrollDetailsList.push({
          periodId: period.id,
          employeeId: employeeId,
          conceptId: concept.id,
          amount: concept.type === 'income' ? '15000.00' : '356.25', // 15k salario, ~356 IMSS
          quantity: '1.00',
          description: `${concept.name} - ${period.period}`
        });
      }
    }

    // Insertar detalles de nómina
    if (payrollDetailsList.length > 0) {
      const insertedDetails = await db.insert(payrollDetails).values(payrollDetailsList).returning();
      console.log(`Detalles de nómina insertados: ${insertedDetails.length}`);
    }

    console.log('✅ Datos de prueba de nómina agregados exitosamente');
    
  } catch (error) {
    console.error('❌ Error agregando datos de prueba de nómina:', error);
    throw error;
  }
}

// Ejecutar automáticamente
addPayrollTestData()
  .then(() => {
    console.log('Script completado');
  })
  .catch((error) => {
    console.error('Error en script:', error);
  });