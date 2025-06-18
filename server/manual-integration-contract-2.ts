import { createFinanceIncomeFromConcessionContract } from "./concessions-finance-integration";

async function runIntegration() {
  try {
    console.log("🏪 Ejecutando integración manual para contrato 2...");
    await createFinanceIncomeFromConcessionContract(2);
    console.log("✅ Integración manual completada exitosamente");
  } catch (error) {
    console.error("❌ Error en integración manual:", error);
  }
}

runIntegration();