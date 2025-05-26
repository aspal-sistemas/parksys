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

// Datos de ejemplo para el catálogo
const mockCatalogItems = [
  {
    id: 1,
    code: "CAT-001",
    name: "Fertilizante Orgánico Premium",
    category: "Jardinería",
    subcategory: "Fertilizantes",
    price: 450.00,
    unit: "Saco 20kg",
    stock: 25,
    supplier: "GreenLife Corp",
    status: "Activo",
    description: "Fertilizante orgánico de alta calidad para áreas verdes"
  },
  {
    id: 2,
    code: "CAT-002",
    name: "Semillas de Césped Resistente",
    category: "Jardinería",
    subcategory: "Semillas",
    price: 380.00,
    unit: "Bolsa 5kg",
    stock: 15,
    supplier: "Semillas del Valle",
    status: "Activo",
    description: "Semillas especiales para clima árido"
  },
  {
    id: 3,
    code: "CAT-003",
    name: "Banco de Concreto Modelo Parque",
    category: "Mobiliario",
    subcategory: "Asientos",
    price: 2850.00,
    unit: "Pieza",
    stock: 8,
    supplier: "Mobiliario Urbano SA",
    status: "Activo",
    description: "Banco de concreto con respaldo, resistente a intemperie"
  },
  {
    id: 4,
    code: "CAT-004",
    name: "Luminaria LED Solar",
    category: "Iluminación",
    subcategory: "Solar",
    price: 1200.00,
    unit: "Pieza",
    stock: 12,
    supplier: "EcoLuz México",
    status: "Activo",
    description: "Luminaria solar con batería de litio y sensor automático"
  },
  {
    id: 5,
    code: "CAT-005",
    name: "Juego Infantil Columpio Doble",
    category: "Recreación",
    subcategory: "Juegos",
    price: 4500.00,
    unit: "Set",
    stock: 3,
    supplier: "Recreos Infantiles",
    status: "Agotado",
    description: "Columpio doble con estructura de acero galvanizado"
  }
];

const categories = [
  "Todos",
  "Jardinería", 
  "Mobiliario", 
  "Iluminación", 
  "Recreación", 
  "Limpieza", 
  "Seguridad"
];

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [activeTab, setActiveTab] = useState("items");

  const filteredItems = mockCatalogItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalItems = mockCatalogItems.length;
  const totalValue = mockCatalogItems.reduce((sum, item) => sum + (item.price * item.stock), 0);
  const lowStockItems = mockCatalogItems.filter(item => item.stock <= 5).length;

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
                  <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Tag className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categorías</p>
                  <p className="text-2xl font-bold">{categories.length - 1}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stock Bajo</p>
                  <p className="text-2xl font-bold">{lowStockItems}</p>
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
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de productos */}
            <Card>
              <CardHeader>
                <CardTitle>Productos en Catálogo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Código</th>
                        <th className="text-left py-3 px-4">Producto</th>
                        <th className="text-left py-3 px-4">Categoría</th>
                        <th className="text-left py-3 px-4">Precio</th>
                        <th className="text-left py-3 px-4">Stock</th>
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
                            <Badge variant="secondary">{item.category}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">${item.price.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">por {item.unit}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              variant={item.stock <= 5 ? "destructive" : "default"}
                            >
                              {item.stock} {item.unit}
                            </Badge>
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
                    <p className="mt-2 text-muted-foreground">No se encontraron productos</p>
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