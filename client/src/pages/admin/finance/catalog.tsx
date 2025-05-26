import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  Package, 
  Tag, 
  DollarSign, 
  Edit, 
  Trash2,
  Filter,
  Minus
} from "lucide-react";
import { Helmet } from "react-helmet";

// Categorías estructuradas para gestión
const incomeCategories = [
  {
    name: "Servicios Recreativos",
    description: "Ingresos por servicios recreativos y deportivos",
    subcategories: ["Canchas deportivas", "Juegos infantiles", "Gimnasio al aire libre"]
  },
  {
    name: "Eventos y Actividades", 
    description: "Ingresos por organización de eventos",
    subcategories: ["Conciertos", "Festivales", "Talleres"]
  },
  {
    name: "Concesiones",
    description: "Ingresos por concesiones comerciales", 
    subcategories: ["Cafeterías", "Tiendas", "Alquiler de bicicletas"]
  },
  {
    name: "Permisos y Licencias",
    description: "Ingresos por permisos de uso del parque",
    subcategories: ["Fotografía comercial", "Grabaciones", "Eventos privados"]
  }
];

const expenseCategories = [
  {
    name: "Personal y Nómina",
    description: "Gastos relacionados con el personal del parque",
    subcategories: ["Salarios", "Prestaciones", "Capacitación"]
  },
  {
    name: "Mantenimiento",
    description: "Gastos de mantenimiento de instalaciones",
    subcategories: ["Jardinería", "Limpieza", "Reparaciones"]
  },
  {
    name: "Servicios Públicos", 
    description: "Gastos de servicios básicos",
    subcategories: ["Electricidad", "Agua", "Internet"]
  },
  {
    name: "Materiales y Suministros",
    description: "Compra de materiales y suministros",
    subcategories: ["Material de oficina", "Herramientas", "Materiales de construcción"]
  }
];

// Conceptos financieros de ejemplo
const financialConcepts = [
  {
    id: 1,
    code: "ING-001",
    name: "Cuotas de Acceso",
    type: "ingreso",
    subcategory: "Servicios Recreativos",
    rate: 50.00,
    unit: "Por persona",
    frequency: "Diario",
    status: "Activo",
    description: "Cuotas de acceso para visitantes del parque"
  },
  {
    id: 2,
    code: "ING-002", 
    name: "Alquiler de Canchas",
    type: "ingreso",
    subcategory: "Servicios Recreativos",
    rate: 200.00,
    unit: "Por hora",
    frequency: "Por uso",
    status: "Activo",
    description: "Alquiler de canchas deportivas por hora"
  },
  {
    id: 3,
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
    id: 4,
    code: "EGR-002",
    name: "Consumo de Electricidad",
    type: "egreso",
    subcategory: "Servicios Públicos",
    cost: 12000.00,
    unit: "Por mes",
    frequency: "Mensual",
    status: "Activo", 
    description: "Consumo eléctrico de iluminación y servicios"
  }
];

// Listas para filtros
const incomeSubcategories = incomeCategories.flatMap(cat => cat.subcategories);
const expenseSubcategories = expenseCategories.flatMap(cat => cat.subcategories);

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("Todos");
  const [selectedType, setSelectedType] = useState("todos");
  const [isNewConceptOpen, setIsNewConceptOpen] = useState(false);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [isEditConceptOpen, setIsEditConceptOpen] = useState(false);
  const [isDeleteConceptOpen, setIsDeleteConceptOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<any>(null);
  const [selectedCategoryToEdit, setSelectedCategoryToEdit] = useState<any>(null);
  
  // Estados del formulario de nuevo concepto
  const [newConcept, setNewConcept] = useState({
    name: "",
    type: "",
    subcategory: "",
    amount: "",
    unit: "",
    frequency: "",
    description: ""
  });

  // Estados del formulario de nueva categoría
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    type: "" // "ingreso" o "egreso"
  });

  const filteredItems = financialConcepts.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === "Todos" || item.subcategory === selectedCategoryFilter;
    const matchesType = selectedType === "todos" || item.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const totalItems = financialConcepts.length;
  const totalIncomes = incomeCategories.length;
  const totalExpenses = expenseCategories.length;
  const activeItems = financialConcepts.filter(item => item.status === "Activo").length;

  const handleCreateConcept = () => {
    // Aquí irá la lógica para crear un nuevo concepto
    console.log("Nuevo concepto:", newConcept);
    setIsNewConceptOpen(false);
    setNewConcept({
      name: "",
      type: "",
      subcategory: "",
      amount: "",
      unit: "",
      frequency: "",
      description: ""
    });
  };

  const handleCreateCategory = () => {
    // Aquí irá la lógica para crear una nueva categoría
    console.log("Nueva categoría:", newCategory);
    setIsNewCategoryOpen(false);
    setNewCategory({
      name: "",
      description: "",
      type: ""
    });
  };

  const getAvailableSubcategories = () => {
    if (newConcept.type === "ingreso") {
      return incomeSubcategories;
    } else if (newConcept.type === "egreso") {
      return expenseSubcategories;
    }
    return [];
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Catálogo Financiero - ParquesMX</title>
        <meta name="description" content="Gestión del catálogo financiero con categorías de ingresos y egresos" />
      </Helmet>

      <div className="space-y-6">
        {/* Encabezado */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Catálogo Financiero</h1>
            <p className="text-muted-foreground">
              Gestiona categorías y conceptos de ingresos y egresos
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isNewConceptOpen} onOpenChange={setIsNewConceptOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Concepto
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Concepto Financiero</DialogTitle>
                  <DialogDescription>
                    Completa los campos para agregar un nuevo concepto financiero al catálogo.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nombre
                    </Label>
                    <Input
                      id="name"
                      value={newConcept.name}
                      onChange={(e) => setNewConcept({...newConcept, name: e.target.value})}
                      className="col-span-3"
                      placeholder="Nombre del concepto"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Tipo
                    </Label>
                    <Select value={newConcept.type} onValueChange={(value) => setNewConcept({...newConcept, type: value, subcategory: ""})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ingreso">Ingreso</SelectItem>
                        <SelectItem value="egreso">Egreso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newConcept.type && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="subcategory" className="text-right">
                        Categoría
                      </Label>
                      <Select value={newConcept.subcategory} onValueChange={(value) => setNewConcept({...newConcept, subcategory: value})}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecciona la categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableSubcategories().map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      {newConcept.type === "ingreso" ? "Tarifa" : "Costo"}
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newConcept.amount}
                      onChange={(e) => setNewConcept({...newConcept, amount: e.target.value})}
                      className="col-span-3"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit" className="text-right">
                      Unidad
                    </Label>
                    <Input
                      id="unit"
                      value={newConcept.unit}
                      onChange={(e) => setNewConcept({...newConcept, unit: e.target.value})}
                      className="col-span-3"
                      placeholder="Por persona, Por hora, etc."
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="frequency" className="text-right">
                      Frecuencia
                    </Label>
                    <Select value={newConcept.frequency} onValueChange={(value) => setNewConcept({...newConcept, frequency: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona la frecuencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Por uso">Por uso</SelectItem>
                        <SelectItem value="Diario">Diario</SelectItem>
                        <SelectItem value="Semanal">Semanal</SelectItem>
                        <SelectItem value="Mensual">Mensual</SelectItem>
                        <SelectItem value="Anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Descripción
                    </Label>
                    <Textarea
                      id="description"
                      value={newConcept.description}
                      onChange={(e) => setNewConcept({...newConcept, description: e.target.value})}
                      className="col-span-3"
                      placeholder="Descripción del concepto financiero"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNewConceptOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateConcept}>
                    Crear Concepto
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Conceptos</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Conceptos Activos</p>
                  <p className="text-2xl font-bold">{activeItems}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="items" className="space-y-4">
          <TabsList>
            <TabsTrigger value="items">Conceptos Financieros</TabsTrigger>
            <TabsTrigger value="categories">Gestión de Categorías</TabsTrigger>
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
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="Todos">Todas las categorías</option>
                      {selectedType === "ingreso" || selectedType === "todos" ? 
                        incomeSubcategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        )) : null}
                      {selectedType === "egreso" || selectedType === "todos" ? 
                        expenseSubcategories.map(category => (
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
                                ${item.type === "ingreso" ? item.rate : (item as any).cost}
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
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedConcept(item);
                                  setIsEditConceptOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedConcept(item);
                                  setIsDeleteConceptOpen(true);
                                }}
                              >
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
            <Tabs defaultValue="ingresos" className="space-y-4">
              <TabsList>
                <TabsTrigger value="ingresos">Categorías de Ingresos</TabsTrigger>
                <TabsTrigger value="egresos">Categorías de Egresos</TabsTrigger>
              </TabsList>

              <TabsContent value="ingresos" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Categorías de Ingresos</CardTitle>
                    <Dialog open={isNewCategoryOpen && newCategory.type === "ingreso"} onOpenChange={(open) => {
                      setIsNewCategoryOpen(open);
                      if (open) setNewCategory({...newCategory, type: "ingreso"});
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setNewCategory({...newCategory, type: "ingreso"})}>
                          <Plus className="h-4 w-4 mr-2" />
                          Nueva Categoría
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                          <DialogTitle>Nueva Categoría de Ingresos</DialogTitle>
                          <DialogDescription>
                            Crear una nueva categoría para organizar los conceptos de ingresos.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="categoryName" className="text-right">
                              Nombre
                            </Label>
                            <Input
                              id="categoryName"
                              value={newCategory.name}
                              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                              className="col-span-3"
                              placeholder="Nombre de la categoría"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="categoryDescription" className="text-right">
                              Descripción
                            </Label>
                            <Textarea
                              id="categoryDescription"
                              value={newCategory.description}
                              onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                              className="col-span-3"
                              placeholder="Descripción de la categoría"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsNewCategoryOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleCreateCategory}>
                            Crear Categoría
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {incomeCategories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">{category.name}</p>
                              <p className="text-sm text-muted-foreground">{category.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">
                              {category.subcategories.length} subcategorías
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedCategoryToEdit(category);
                                setIsEditCategoryOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                console.log("Agregando subcategoría a ingresos:", category);
                                // Aquí irá la lógica para agregar subcategoría
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="egresos" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Categorías de Egresos</CardTitle>
                    <Dialog open={isNewCategoryOpen && newCategory.type === "egreso"} onOpenChange={(open) => {
                      setIsNewCategoryOpen(open);
                      if (open) setNewCategory({...newCategory, type: "egreso"});
                    }}>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={() => setNewCategory({...newCategory, type: "egreso"})}>
                          <Plus className="h-4 w-4 mr-2" />
                          Nueva Categoría
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                          <DialogTitle>Nueva Categoría de Egresos</DialogTitle>
                          <DialogDescription>
                            Crear una nueva categoría para organizar los conceptos de egresos.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="categoryNameEgreso" className="text-right">
                              Nombre
                            </Label>
                            <Input
                              id="categoryNameEgreso"
                              value={newCategory.name}
                              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                              className="col-span-3"
                              placeholder="Nombre de la categoría"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="categoryDescriptionEgreso" className="text-right">
                              Descripción
                            </Label>
                            <Textarea
                              id="categoryDescriptionEgreso"
                              value={newCategory.description}
                              onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                              className="col-span-3"
                              placeholder="Descripción de la categoría"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsNewCategoryOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleCreateCategory}>
                            Crear Categoría
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {expenseCategories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-medium">{category.name}</p>
                              <p className="text-sm text-muted-foreground">{category.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">
                              {category.subcategories.length} subcategorías
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedCategoryToEdit(category);
                                setIsEditCategoryOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                console.log("Agregando subcategoría a egresos:", category);
                                // Aquí irá la lógica para agregar subcategoría
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal para editar concepto */}
      <Dialog open={isEditConceptOpen} onOpenChange={setIsEditConceptOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Concepto Financiero</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedConcept && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Código</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      defaultValue={selectedConcept.code}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre del Concepto</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      defaultValue={selectedConcept.name}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo</label>
                    <select className="w-full px-3 py-2 border rounded-md" defaultValue={selectedConcept.type}>
                      <option value="ingreso">Ingreso</option>
                      <option value="egreso">Egreso</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Categoría</label>
                    <select className="w-full px-3 py-2 border rounded-md" defaultValue={selectedConcept.subcategory}>
                      {selectedConcept.type === "ingreso" 
                        ? incomeSubcategories.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))
                        : expenseSubcategories.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))
                      }
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Monto/Tasa</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border rounded-md"
                      defaultValue={selectedConcept.rate || selectedConcept.cost}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Unidad</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      defaultValue={selectedConcept.unit}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Frecuencia</label>
                    <select className="w-full px-3 py-2 border rounded-md" defaultValue={selectedConcept.frequency}>
                      <option value="Diario">Diario</option>
                      <option value="Mensual">Mensual</option>
                      <option value="Por uso">Por uso</option>
                      <option value="Anual">Anual</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    defaultValue={selectedConcept.description}
                  />
                </div>
              </>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditConceptOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                console.log("Guardando cambios del concepto:", selectedConcept);
                setIsEditConceptOpen(false);
              }}>
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para eliminar concepto */}
      <Dialog open={isDeleteConceptOpen} onOpenChange={setIsDeleteConceptOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Concepto Financiero</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedConcept && (
              <>
                <p className="text-sm text-muted-foreground">
                  ¿Estás seguro de que deseas eliminar el siguiente concepto?
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{selectedConcept.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedConcept.code}</p>
                  <p className="text-sm text-muted-foreground">{selectedConcept.description}</p>
                </div>
                <p className="text-sm text-red-600">
                  Esta acción no se puede deshacer.
                </p>
              </>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteConceptOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={() => {
                console.log("Eliminando concepto:", selectedConcept);
                setIsDeleteConceptOpen(false);
              }}>
                Eliminar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para editar categoría */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Categoría Financiera</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCategoryToEdit && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre de la Categoría</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md"
                    defaultValue={selectedCategoryToEdit.name}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                    defaultValue={selectedCategoryToEdit.description}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select 
                    className="w-full px-3 py-2 border rounded-md" 
                    defaultValue={selectedCategoryToEdit.type || (selectedCategoryToEdit.subcategories && incomeSubcategories.includes(selectedCategoryToEdit.subcategories[0]) ? "ingreso" : "egreso")}
                  >
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subcategorías</label>
                  <div className="text-sm text-muted-foreground">
                    {selectedCategoryToEdit.subcategories && selectedCategoryToEdit.subcategories.length > 0 
                      ? selectedCategoryToEdit.subcategories.join(", ")
                      : "Sin subcategorías"
                    }
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditCategoryOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                console.log("Guardando cambios de categoría:", selectedCategoryToEdit);
                setIsEditCategoryOpen(false);
              }}>
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}