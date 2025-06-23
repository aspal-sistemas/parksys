import { db } from "./db";
import { 
  payrollReceipts, 
  payrollReceiptDetails,
  payrollPeriods,
  payrollConcepts,
  employees 
} from "../shared/schema";
import { eq } from "drizzle-orm";

/**
 * Script para crear datos de muestra de recibos de nómina
 */
export async function seedPayrollReceipts() {
  try {
    console.log("Iniciando creación de datos de muestra para recibos de nómina...");

    // Verificar que existan empleados (using correct schema)
    const existingEmployees = await db.select().from(employees).limit(3);
    if (existingEmployees.length === 0) {
      console.log("No hay empleados disponibles para crear recibos");
      return;
    }

    // Verificar que existan períodos de nómina
    const existingPeriods = await db.select().from(payrollPeriods).limit(2);
    if (existingPeriods.length === 0) {
      console.log("No hay períodos de nómina disponibles");
      return;
    }

    // Verificar que existan conceptos de nómina
    const existingConcepts = await db.select().from(payrollConcepts).limit(3);
    if (existingConcepts.length === 0) {
      console.log("No hay conceptos de nómina disponibles");
      return;
    }

    // Crear recibos de muestra
    const receiptsData = [
      {
        periodId: existingPeriods[0].id,
        employeeId: existingEmployees[0].id,
        receiptNumber: "REC-2024-001",
        payDate: "2024-12-15",
        employeeName: existingEmployees[0].fullName,
        employeePosition: existingEmployees[0].position || "Empleado",
        employeeDepartment: existingEmployees[0].department || "General",
        employeeRFC: "XXXX999999XXX",
        totalGross: "15000.00",
        totalDeductions: "2250.00",
        totalNet: "12750.00",
        status: "generated" as const,
        pdfGenerated: true,
        generatedById: 1
      },
      {
        periodId: existingPeriods[0].id,
        employeeId: existingEmployees[1].id,
        receiptNumber: "REC-2024-002",
        payDate: "2024-12-15",
        employeeName: existingEmployees[1].fullName,
        employeePosition: existingEmployees[1].position || "Empleado",
        employeeDepartment: existingEmployees[1].department || "General",
        employeeRFC: "YYYY888888YYY",
        totalGross: "18000.00",
        totalDeductions: "2700.00",
        totalNet: "15300.00",
        status: "sent" as const,
        pdfGenerated: true,
        generatedById: 1
      }
    ];

    // Verificar si ya existen recibos para evitar duplicados
    const existingReceipts = await db.select().from(payrollReceipts).limit(1);
    if (existingReceipts.length > 0) {
      console.log("Los recibos de nómina ya existen. Saltando creación para evitar duplicados.");
      return;
    }

    // Insertar recibos con protección contra duplicados
    const insertedReceipts = await db.insert(payrollReceipts)
      .values(receiptsData)
      .onConflictDoNothing({ target: payrollReceipts.receiptNumber })
      .returning();
    console.log(`${insertedReceipts.length} recibos de nómina creados exitosamente`);

    // Crear detalles para cada recibo
    for (let i = 0; i < insertedReceipts.length; i++) {
      const receipt = insertedReceipts[i];
      const conceptsToUse = existingConcepts.slice(0, 3); // Usar los primeros 3 conceptos

      const detailsData = [
        {
          receiptId: receipt.id,
          conceptId: conceptsToUse[0].id,
          conceptCode: conceptsToUse[0].code,
          conceptName: conceptsToUse[0].name,
          conceptType: conceptsToUse[0].type,
          conceptCategory: conceptsToUse[0].category,
          quantity: "1.00",
          rate: i === 0 ? "15000.00" : "18000.00",
          amount: i === 0 ? "15000.00" : "18000.00",
          description: "Salario base mensual",
          sortOrder: 1
        },
        {
          receiptId: receipt.id,
          conceptId: conceptsToUse[1].id,
          conceptCode: conceptsToUse[1].code,
          conceptName: conceptsToUse[1].name,
          conceptType: conceptsToUse[1].type,
          conceptCategory: conceptsToUse[1].category,
          quantity: "1.00",
          rate: i === 0 ? "1500.00" : "1800.00",
          amount: i === 0 ? "1500.00" : "1800.00",
          description: "Deducción IMSS",
          sortOrder: 2
        },
        {
          receiptId: receipt.id,
          conceptId: conceptsToUse[2].id,
          conceptCode: conceptsToUse[2].code,
          conceptName: conceptsToUse[2].name,
          conceptType: conceptsToUse[2].type,
          conceptCategory: conceptsToUse[2].category,
          quantity: "1.00",
          rate: i === 0 ? "750.00" : "900.00",
          amount: i === 0 ? "750.00" : "900.00",
          description: "Deducción ISR",
          sortOrder: 3
        }
      ];

      await db.insert(payrollReceiptDetails).values(detailsData);
    }

    console.log("Detalles de recibos creados exitosamente");
    console.log("Datos de muestra para recibos de nómina completados");

  } catch (error) {
    console.error("Error al crear datos de muestra para recibos:", error);
    throw error;
  }
}