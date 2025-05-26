import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  Package, 
  Tag, 
  DollarSign, 
  Edit, 
  Trash2,
  Filter,
  Download,
  Upload
} from "lucide-react";
import { Helmet } from "react-helmet";

// Datos de ejemplo para el catálogo financiero
const mockIncomeCategories = [
  {
    id: 1,
    code: "ING-001",
    name: "Cuotas de Acceso",
    type: "ingreso",
    subcategory: "Tarifas",
    rate: 25.00,
    unit: "Por persona",
    frequency: "Diaria",
    status: "Activo",
    description: "Cuota de acceso general al parque"
  },
  {
    id: 2,
    code: "ING-002", 
    name: "Renta de Espacios para Eventos",
    type: "ingreso",
    subcategory: "Alquileres",
    rate: 1500.00,
    unit: "Por día",
    frequency: "Variable",
    status: "Activo",
    description: "Renta de áreas para eventos privados y corporativos"
  },
  {
    id: 3,
    code: "ING-003",
    name: "Estacionamiento",
    type: "ingreso", 
    subcategory: "Servicios",
    rate: 15.00,
    unit: "Por hora",
    frequency: "Continua",
    status: "Activo",
    description: "Servicio de estacionamiento público"
  },
  {
    id: 4,
    code: "ING-004",
    name: "Concesiones de Alimentos",
    type: "ingreso",
    subcategory: "Concesiones",
    rate: 8.5,
    unit: "% de ventas",
    frequency: "Mensual",
    status: "Activo",
    description: "Porcentaje sobre ventas de concesionarios de alimentos"
  }
];

const mockExpenseCategories = [
  {
    id: 5,
    code: "EGR-001",
    name: "Mantenimiento de Jardines",
    type: "egreso",
    subcategory: "Mantenimiento",
    cost: 8500.00,
    unit: "Por mes",
    frequency: "Mensual",
    status: "Activo",
    description: "Servicios de jardinería y mantenimiento de áreas verdes"
  },
  {
    id: 6,
    code: "EGR-002",
    name: "Consumo de Electricidad",
    type: "egreso",
    subcategory: "Servicios Públicos",
    cost: 12000.00,
    unit: "Por mes",
    frequency: "Mensual", 
    status: "Activo",
    description: "Consumo eléctrico de iluminación y servicios"
  },
  {
    id: 7,
    code: "EGR-003",
    name: "Salarios Personal de Seguridad",
    type: "egreso",
    subcategory: "Nómina",
    cost: 45000.00,
    unit: "Por mes",
    frequency: "Mensual",
    status: "Activo",
    description: "Salarios y prestaciones del personal de seguridad"
  },
  {
    id: 8,
    code: "EGR-004",
    name: "Materiales de Limpieza",
    type: "egreso",
    subcategory: "Suministros",
    cost: 3200.00,
    unit: "Por mes",
    frequency: "Mensual",
    status: "Activo",
    description: "Productos y materiales para limpieza y sanitización"
  }
];

const allCatalogItems = [...mockIncomeCategories, ...mockExpenseCategories];

const incomeCategories = [
  "Todos",
  "Tarifas",
  "Alquileres", 
  "Servicios",
  "Concesiones",
  "Donaciones",
  "Subsidios"
];

const expenseCategories = [
  "Todos",
  "Mantenimiento",
  "Servicios Públicos",
  "Nómina",
  "Suministros",
  "Seguros",
  "Capacitación"
];

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedType, setSelectedType] = useState("todos");
  const [activeTab, setActiveTab] = useState("items");

  const filteredItems = allCatalogItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || item.subcategory === selectedCategory;
    const matchesType = selectedType === "todos" || item.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const totalItems = allCatalogItems.length;
  const totalIncomes = mockIncomeCategories.length;
  const totalExpenses = mockExpenseCategories.length;
  const activeItems = allCatalogItems.filter(item => item.status === "Activo").length;

  return (
    <AdminLayout>
      <Helmet>
        <title>Catálogo de Productos y Servicios | ParquesMX</title>
        <meta 
          name="description" 
          content="Gestión del catálogo de productos y servicios para parques municipales" 
        />
      </Helmet>

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Catálogo de Productos y Servicios</h1>
            <p className="text-muted-foreground">
              Gestión integral del inventario y catálogo de productos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{totalItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categorías Ingresos</p>
                  <p className="text-2xl font-bold">{totalIncomes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Tag className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categorías Egresos</p>
                  <p className="text-2xl font-bold">{totalExpenses}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Items Activos</p>
                  <p className="text-2xl font-bold">{activeItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="items" className="space-y-4">
          <TabsList>
            <TabsTrigger value="items">Productos</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar conceptos financieros..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="todos">Todos los tipos</option>
                      <option value="ingreso">Ingresos</option>
                      <option value="egreso">Egresos</option>
                    </select>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="Todos">Todas las categorías</option>
                      {selectedType === "ingreso" || selectedType === "todos" ? 
                        incomeCategories.slice(1).map(category => (
                          <option key={category} value={category}>{category}</option>
                        )) : null}
                      {selectedType === "egreso" || selectedType === "todos" ? 
                        expenseCategories.slice(1).map(category => (
                          <option key={category} value={category}>{category}</option>
                        )) : null}
                    </select>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de conceptos financieros */}
            <Card>
              <CardHeader>
                <CardTitle>Catálogo Financiero</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Código</th>
                        <th className="text-left py-3 px-4">Concepto</th>
                        <th className="text-left py-3 px-4">Tipo</th>
                        <th className="text-left py-3 px-4">Categoría</th>
                        <th className="text-left py-3 px-4">Monto/Tasa</th>
                        <th className="text-left py-3 px-4">Frecuencia</th>
                        <th className="text-left py-3 px-4">Estado</th>
                        <th className="text-left py-3 px-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-sm">{item.code}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={item.type === "ingreso" ? "default" : "destructive"}>
                              {item.type === "ingreso" ? "Ingreso" : "Egreso"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary">{item.subcategory}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">
                                {item.type === "ingreso" 
                                  ? `$${item.rate || '0.00'}`
                                  : `$${(item as any).cost || '0.00'}`
                                }
                              </p>
                              <p className="text-xs text-muted-foreground">{item.unit}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm">{item.frequency}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={item.status === "Activo" ? "default" : "secondary"}
                            >
                              {item.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredItems.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-muted-foreground">No se encontraron conceptos financieros</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Categorías</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Próximamente: Gestión de categorías y subcategorías
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Proveedores</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Próximamente: Directorio y gestión de proveedores
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reportes del Catálogo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Próximamente: Reportes de inventario y análisis
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}