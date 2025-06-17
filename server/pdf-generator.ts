import pdf from 'html-pdf-node';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

// Registrar helpers de Handlebars
Handlebars.registerHelper('formatCurrency', function(amount: string | number) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(num || 0);
});

Handlebars.registerHelper('eq', function(a: any, b: any) {
  return a === b;
});

// Crear directorio para PDFs si no existe
const PDF_DIR = path.join(process.cwd(), 'public', 'receipts');
if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true });
}

// Template HTML para el recibo de nómina
const RECEIPT_TEMPLATE = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recibo de Nómina - {{receiptNumber}}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #00a587;
            padding-bottom: 20px;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #00a587;
            margin-bottom: 5px;
        }
        
        .document-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin: 10px 0;
        }
        
        .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        
        .receipt-number {
            font-weight: bold;
            color: #067f5f;
        }
        
        .employee-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #00a587;
        }
        
        .employee-info h3 {
            color: #00a587;
            margin-bottom: 10px;
            font-size: 14px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        
        .info-item {
            display: flex;
        }
        
        .info-label {
            font-weight: bold;
            width: 120px;
        }
        
        .info-value {
            color: #555;
        }
        
        .period-info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #2196f3;
        }
        
        .period-info h3 {
            color: #1976d2;
            margin-bottom: 10px;
            font-size: 14px;
        }
        
        .concepts-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .concepts-table th,
        .concepts-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .concepts-table th {
            background: linear-gradient(135deg, #00a587 0%, #067f5f 100%);
            color: white;
            font-weight: bold;
            font-size: 13px;
        }
        
        .concepts-table tbody tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .concepts-table tbody tr:hover {
            background: #e8f5e8;
        }
        
        .amount {
            text-align: right;
            font-weight: bold;
        }
        
        .income {
            color: #28a745;
        }
        
        .deduction {
            color: #dc3545;
        }
        
        .totals-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #00a587;
        }
        
        .totals-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 15px;
        }
        
        .total-item {
            text-align: center;
            padding: 15px;
            border-radius: 6px;
        }
        
        .total-gross {
            background: #d4edda;
            border: 1px solid #c3e6cb;
        }
        
        .total-deductions {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
        }
        
        .total-net {
            background: #bcd256;
            border: 1px solid #a8c332;
            font-size: 16px;
            font-weight: bold;
        }
        
        .total-label {
            font-size: 11px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .total-amount {
            font-size: 18px;
            font-weight: bold;
        }
        
        .net-amount {
            font-size: 24px !important;
            color: #2d5016;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #00a587;
            text-align: center;
            font-size: 11px;
            color: #666;
        }
        
        .signature-section {
            margin-top: 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }
        
        .signature-box {
            text-align: center;
            padding-top: 30px;
            border-top: 1px solid #333;
        }
        
        .legal-notice {
            margin-top: 20px;
            font-size: 10px;
            color: #888;
            text-align: justify;
        }
        
        @media print {
            body {
                margin: 0;
            }
            .container {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="company-name">Parques de México</div>
            <div class="document-title">RECIBO DE NÓMINA</div>
            <div class="receipt-info">
                <span class="receipt-number">No. {{receiptNumber}}</span>
                <span>Fecha de Generación: {{generatedDate}}</span>
            </div>
        </div>

        <!-- Información del Empleado -->
        <div class="employee-info">
            <h3>DATOS DEL EMPLEADO</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Nombre:</span>
                    <span class="info-value">{{employeeName}}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Puesto:</span>
                    <span class="info-value">{{employeePosition}}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Departamento:</span>
                    <span class="info-value">{{employeeDepartment}}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">RFC:</span>
                    <span class="info-value">{{employeeRFC}}</span>
                </div>
            </div>
        </div>

        <!-- Información del Período -->
        <div class="period-info">
            <h3>PERÍODO DE PAGO</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Período:</span>
                    <span class="info-value">{{periodName}}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha de Pago:</span>
                    <span class="info-value">{{payDate}}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Desde:</span>
                    <span class="info-value">{{periodStartDate}}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Hasta:</span>
                    <span class="info-value">{{periodEndDate}}</span>
                </div>
            </div>
        </div>

        <!-- Tabla de Conceptos -->
        <table class="concepts-table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Concepto</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Importe</th>
                </tr>
            </thead>
            <tbody>
                {{#each details}}
                <tr>
                    <td>{{conceptCode}}</td>
                    <td>{{conceptName}}</td>
                    <td>
                        {{#if (eq conceptType 'income')}}
                            <span class="income">Percepción</span>
                        {{else}}
                            <span class="deduction">Deducción</span>
                        {{/if}}
                    </td>
                    <td>{{quantity}}</td>
                    <td class="amount {{#if (eq conceptType 'income')}}income{{else}}deduction{{/if}}">
                        {{formatCurrency amount}}
                    </td>
                </tr>
                {{/each}}
            </tbody>
        </table>

        <!-- Totales -->
        <div class="totals-section">
            <div class="totals-grid">
                <div class="total-item total-gross">
                    <div class="total-label">TOTAL PERCEPCIONES</div>
                    <div class="total-amount income">{{formatCurrency totalGross}}</div>
                </div>
                <div class="total-item total-deductions">
                    <div class="total-label">TOTAL DEDUCCIONES</div>
                    <div class="total-amount deduction">{{formatCurrency totalDeductions}}</div>
                </div>
                <div class="total-item total-net">
                    <div class="total-label">NETO A PAGAR</div>
                    <div class="total-amount net-amount">{{formatCurrency totalNet}}</div>
                </div>
            </div>
        </div>

        <!-- Firmas -->
        <div class="signature-section">
            <div class="signature-box">
                <strong>RECIBÍ CONFORME</strong><br>
                Empleado
            </div>
            <div class="signature-box">
                <strong>AUTORIZÓ</strong><br>
                Recursos Humanos
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="legal-notice">
                Este documento constituye comprobante oficial del pago de nómina correspondiente al período indicado.
                Para cualquier aclaración, dirigirse al Departamento de Recursos Humanos.
                <br><br>
                <strong>Parques de México</strong> - Sistema de Gestión de Parques Urbanos
            </div>
        </div>
    </div>
</body>
</html>
`;

// Registrar helpers de Handlebars
Handlebars.registerHelper('formatCurrency', function(amount: string | number) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
});

Handlebars.registerHelper('eq', function(a: any, b: any) {
  return a === b;
});

Handlebars.registerHelper('formatDate', function(date: string | Date) {
  const d = new Date(date);
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d);
});

// Función principal para generar PDF
export async function generateReceiptPDF(receiptData: any): Promise<{
  fileName: string;
  filePath: string;
  buffer: Buffer;
}> {
  try {
    // Compilar template
    const template = Handlebars.compile(RECEIPT_TEMPLATE);
    
    // Preparar datos para el template
    const templateData = {
      ...receiptData.payroll_receipts,
      periodName: receiptData.payroll_periods?.period || 'N/A',
      periodStartDate: formatDate(receiptData.payroll_periods?.startDate),
      periodEndDate: formatDate(receiptData.payroll_periods?.endDate),
      generatedDate: formatDate(receiptData.payroll_receipts?.generatedDate || new Date()),
      payDate: formatDate(receiptData.payroll_receipts?.payDate),
      details: receiptData.details || []
    };
    
    // Generar HTML
    const html = template(templateData);
    
    // Configuración para PDF
    const options = {
      format: 'A4',
      border: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    };
    
    // Generar PDF
    const pdfBuffer = await pdf.generatePdf({ content: html }, options);
    
    // Generar nombre de archivo único
    const timestamp = new Date().getTime();
    const fileName = `recibo_${receiptData.payroll_receipts?.receiptNumber?.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;
    const filePath = path.join('public', 'receipts', fileName);
    const fullPath = path.join(process.cwd(), filePath);
    
    // Guardar archivo
    fs.writeFileSync(fullPath, pdfBuffer);
    
    return {
      fileName,
      filePath,
      buffer: pdfBuffer
    };
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error('Error al generar el PDF del recibo');
  }
}

// Función auxiliar para formatear fechas
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const d = new Date(date);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  } catch {
    return 'N/A';
  }
}

// Función para limpiar archivos PDF antiguos (opcional)
export function cleanupOldPDFs(daysOld: number = 30) {
  try {
    const files = fs.readdirSync(PDF_DIR);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    files.forEach(file => {
      const filePath = path.join(PDF_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        console.log(`Archivo PDF antiguo eliminado: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error limpiando archivos PDF antiguos:', error);
  }
}