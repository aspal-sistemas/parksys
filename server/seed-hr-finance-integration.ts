import { db } from "./db";
import { 
  employees, 
  payrollConcepts, 
  payrollPeriods, 
  payrollDetails, 
  actualExpenses,
  expenseCategories 
} from "@shared/schema";

/**
 * Script para inicializar datos de muestra de la integración HR-Finanzas
 */
export async function seedHRFinanceIntegration() {
  try {
    console.log("Iniciando creación de datos de integración HR-Finanzas...");

    // 1. Crear categorías de gastos específicas para nómina
    const payrollExpenseCategories = [
      {
        code: "PERS-SAL",
        name: "Salarios y Sueldos",
        description: "Gastos de nómina - Salarios base del personal",
        level: 1,
        isActive: true,
        sortOrder: 1
      },
      {
        code: "PERS-BON",
        name: "Bonificaciones",
        description: "Gastos de nómina - Bonos y incentivos",
        level: 1,
        isActive: true,
        sortOrder: 2
      },
      {
        code: "PERS-OVT",
        name: "Tiempo Extra",
        description: "Gastos de nómina - Horas extras trabajadas",
        level: 1,
        isActive: true,
        sortOrder: 3
      }
    ];

    const createdCategories = [];
    for (const category of payrollExpenseCategories) {
      try {
        const [existingCategory] = await db
          .select()
          .from(expenseCategories)
          .where(eq(expenseCategories.code, category.code));
        
        if (!existingCategory) {
          const [newCategory] = await db
            .insert(expenseCategories)
            .values(category)
            .returning();
          createdCategories.push(newCategory);
          console.log(`Categoría creada: ${newCategory.name}`);
        } else {
          createdCategories.push(existingCategory);
          console.log(`Categoría existe: ${existingCategory.name}`);
        }
      } catch (error) {
        console.error(`Error creando categoría ${category.code}:`, error);
      }
    }

    // 2. Crear empleados de muestra
    const sampleEmployees = [
      {
        employeeCode: "EMP001",
        fullName: "María Elena González Ruiz",
        email: "maria.gonzalez@parques.mx",
        phone: "55-1234-5678",
        position: "Coordinadora de Eventos",
        department: "Eventos y Actividades",
        parkId: 1,
        hireDate: "2023-01-15",
        baseSalary: "35000.00",
        salaryType: "monthly",
        status: "active",
        contractType: "permanent",
        workSchedule: "full_time"
      },
      {
        employeeCode: "EMP002",
        fullName: "Carlos Alberto Mendoza López",
        email: "carlos.mendoza@parques.mx",
        phone: "55-2345-6789",
        position: "Instructor de Deportes",
        department: "Deportes y Recreación",
        parkId: 1,
        hireDate: "2023-03-01",
        baseSalary: "28000.00",
        salaryType: "monthly",
        status: "active",
        contractType: "permanent",
        workSchedule: "full_time"
      },
      {
        employeeCode: "EMP003",
        fullName: "Ana Patricia Flores Jiménez",
        email: "ana.flores@parques.mx",
        phone: "55-3456-7890",
        position: "Jardinera Principal",
        department: "Mantenimiento y Jardinería",
        parkId: 1,
        hireDate: "2022-06-15",
        baseSalary: "25000.00",
        salaryType: "monthly",
        status: "active",
        contractType: "permanent",
        workSchedule: "full_time"
      }
    ];

    const createdEmployees = [];
    for (const employee of sampleEmployees) {
      try {
        const [existingEmployee] = await db
          .select()
          .from(employees)
          .where(eq(employees.employeeCode, employee.employeeCode));
        
        if (!existingEmployee) {
          const [newEmployee] = await db
            .insert(employees)
            .values(employee)
            .returning();
          createdEmployees.push(newEmployee);
          console.log(`Empleado creado: ${newEmployee.fullName}`);
        } else {
          createdEmployees.push(existingEmployee);
          console.log(`Empleado existe: ${existingEmployee.fullName}`);
        }
      } catch (error) {
        console.error(`Error creando empleado ${employee.employeeCode}:`, error);
      }
    }

    // 3. Crear conceptos de nómina
    const payrollConceptsData = [
      {
        code: "SAL-BASE",
        name: "Salario Base",
        type: "income",
        category: "salary",
        isFixed: true,
        isActive: true,
        expenseCategoryId: createdCategories.find(c => c.code === "PERS-SAL")?.id,
        sortOrder: 1
      },
      {
        code: "BON-PROD",
        name: "Bono de Productividad",
        type: "income",
        category: "bonus",
        isFixed: false,
        isActive: true,
        expenseCategoryId: createdCategories.find(c => c.code === "PERS-BON")?.id,
        sortOrder: 2
      },
      {
        code: "HRS-EXTRA",
        name: "Horas Extra",
        type: "income",
        category: "overtime",
        isFixed: false,
        isActive: true,
        expenseCategoryId: createdCategories.find(c => c.code === "PERS-OVT")?.id,
        sortOrder: 3
      }
    ];

    const createdConcepts = [];
    for (const concept of payrollConceptsData) {
      try {
        const [existingConcept] = await db
          .select()
          .from(payrollConcepts)
          .where(eq(payrollConcepts.code, concept.code));
        
        if (!existingConcept) {
          const [newConcept] = await db
            .insert(payrollConcepts)
            .values(concept)
            .returning();
          createdConcepts.push(newConcept);
          console.log(`Concepto creado: ${newConcept.name}`);
        } else {
          createdConcepts.push(existingConcept);
          console.log(`Concepto existe: ${existingConcept.name}`);
        }
      } catch (error) {
        console.error(`Error creando concepto ${concept.code}:`, error);
      }
    }

    // 4. Crear período de nómina actual
    const currentDate = new Date();
    const periodName = `Nómina ${currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}`;
    
    const payrollPeriodData = {
      name: periodName,
      periodType: "monthly",
      startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0],
      payDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 5).toISOString().split('T')[0],
      status: "calculated",
      totalGross: "0",
      totalDeductions: "0",
      totalNet: "0"
    };

    let createdPeriod;
    try {
      const [existingPeriod] = await db
        .select()
        .from(payrollPeriods)
        .where(eq(payrollPeriods.name, periodName));
      
      if (!existingPeriod) {
        [createdPeriod] = await db
          .insert(payrollPeriods)
          .values(payrollPeriodData)
          .returning();
        console.log(`Período de nómina creado: ${createdPeriod.name}`);
      } else {
        createdPeriod = existingPeriod;
        console.log(`Período de nómina existe: ${existingPeriod.name}`);
      }
    } catch (error) {
      console.error("Error creando período de nómina:", error);
      return;
    }

    // 5. Crear detalles de nómina para cada empleado
    const payrollDetailsData = [];
    
    for (const employee of createdEmployees) {
      // Salario base
      const salaryBaseConcept = createdConcepts.find(c => c.code === "SAL-BASE");
      if (salaryBaseConcept) {
        payrollDetailsData.push({
          payrollPeriodId: createdPeriod.id,
          employeeId: employee.id,
          conceptId: salaryBaseConcept.id,
          hours: 160, // Horas mensuales estándar
          rate: parseFloat(employee.baseSalary) / 160,
          amount: employee.baseSalary
        });
      }

      // Bono de productividad (aleatorio)
      const bonusConcept = createdConcepts.find(c => c.code === "BON-PROD");
      if (bonusConcept && Math.random() > 0.5) {
        const bonusAmount = (parseFloat(employee.baseSalary) * 0.1).toFixed(2);
        payrollDetailsData.push({
          payrollPeriodId: createdPeriod.id,
          employeeId: employee.id,
          conceptId: bonusConcept.id,
          hours: 0,
          rate: 0,
          amount: bonusAmount
        });
      }

      // Horas extra (ocasional)
      const overtimeConcept = createdConcepts.find(c => c.code === "HRS-EXTRA");
      if (overtimeConcept && Math.random() > 0.7) {
        const overtimeHours = Math.floor(Math.random() * 20) + 5;
        const hourlyRate = parseFloat(employee.baseSalary) / 160;
        const overtimeRate = hourlyRate * 1.5; // 50% extra
        const overtimeAmount = (overtimeHours * overtimeRate).toFixed(2);
        
        payrollDetailsData.push({
          payrollPeriodId: createdPeriod.id,
          employeeId: employee.id,
          conceptId: overtimeConcept.id,
          hours: overtimeHours,
          rate: overtimeRate.toFixed(2),
          amount: overtimeAmount
        });
      }
    }

    // Insertar detalles de nómina
    for (const detail of payrollDetailsData) {
      try {
        await db.insert(payrollDetails).values(detail);
        console.log(`Detalle de nómina creado para empleado ${detail.employeeId}`);
      } catch (error) {
        console.error("Error creando detalle de nómina:", error);
      }
    }

    // 6. Generar gastos automáticamente desde la nómina
    console.log("Generando gastos automáticos desde nómina...");
    
    // Calcular totales por concepto
    const conceptTotals = await db
      .select({
        conceptId: payrollDetails.conceptId,
        conceptName: payrollConcepts.name,
        expenseCategoryId: payrollConcepts.expenseCategoryId,
        totalAmount: sql<number>`sum(${payrollDetails.amount})`
      })
      .from(payrollDetails)
      .innerJoin(payrollConcepts, eq(payrollDetails.conceptId, payrollConcepts.id))
      .where(eq(payrollDetails.payrollPeriodId, createdPeriod.id))
      .groupBy(payrollDetails.conceptId, payrollConcepts.name, payrollConcepts.expenseCategoryId);

    // Crear gastos por cada concepto
    for (const total of conceptTotals) {
      if (total.expenseCategoryId) {
        try {
          const expenseData = {
            parkId: 1,
            categoryId: total.expenseCategoryId,
            concept: `Nómina - ${total.conceptName}`,
            amount: total.totalAmount.toFixed(2),
            date: createdPeriod.payDate,
            month: new Date(createdPeriod.payDate).getMonth() + 1,
            year: new Date(createdPeriod.payDate).getFullYear(),
            supplier: "Departamento de Recursos Humanos",
            description: `Gasto generado automáticamente desde nómina del período ${createdPeriod.name}`,
            referenceNumber: `NOM-${createdPeriod.id}-${total.conceptId}`,
            isPaid: true
          };

          await db.insert(actualExpenses).values(expenseData);
          console.log(`Gasto automático creado: ${expenseData.concept} - ${expenseData.amount}`);
        } catch (error) {
          console.error("Error creando gasto automático:", error);
        }
      }
    }

    // Actualizar totales del período
    const totalGross = payrollDetailsData.reduce((sum, detail) => sum + parseFloat(detail.amount), 0);
    await db
      .update(payrollPeriods)
      .set({
        totalGross: totalGross.toFixed(2),
        totalNet: totalGross.toFixed(2), // Simplificado - sin deducciones
        updatedAt: new Date()
      })
      .where(eq(payrollPeriods.id, createdPeriod.id));

    console.log("✅ Integración HR-Finanzas inicializada correctamente");
    console.log(`📊 Total empleados: ${createdEmployees.length}`);
    console.log(`💰 Total nómina: $${totalGross.toLocaleString('es-MX')}`);
    console.log(`📝 Gastos automáticos generados: ${conceptTotals.length}`);

  } catch (error) {
    console.error("❌ Error en la integración HR-Finanzas:", error);
  }
}

// Importaciones necesarias para que funcione el script
import { eq, sql } from "drizzle-orm";