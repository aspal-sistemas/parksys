import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/components/AdminLayout';
import { Leaf, Search, Plus, TreePine, Filter, CircleCheck, CircleAlert, Eye, Download, Upload, FileSpreadsheet, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import TreeSpeciesIcon from '@/components/ui/tree-species-icon';

interface TreeSpecies {
  id: number;
  commonName: string;
  scientificName: string;
  family: string;
  origin: string;
  growthRate: string;
  imageUrl: string;
  isEndangered: boolean;
  iconType?: 'system' | 'custom';
  customIconUrl?: string | null;
  customPhotoUrl?: string | null;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function TreeSpeciesCatalog() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconFileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('common_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isIconUploadDialogOpen, setIsIconUploadDialogOpen] = useState(false);
  const [selectedIconFiles, setSelectedIconFiles] = useState<FileList | null>(null);
  const [iconUploadFamily, setIconUploadFamily] = useState('general');
  const [isUploading, setIsUploading] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/tree-species', searchTerm, originFilter, currentPage, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (originFilter !== 'all') params.append('origin', originFilter);
      params.append('page', currentPage.toString());
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      const response = await fetch(`/api/tree-species?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Error al cargar especies arbóreas');
      }
      return response.json();
    }
  });

  const species: TreeSpecies[] = data?.data || [];
  const pagination: PaginationInfo = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCreateNew = () => {
    setLocation('/admin/trees/catalog/new');
  };

  const handleViewDetails = (id: number) => {
    setLocation(`/admin/trees/catalog/${id}`);
  };

  // Mutación para importar CSV
  const importMutation = useMutation({
    mutationFn: async (data: any[]) => {
      console.log("=== MUTATION FUNCTION ===");
      console.log("Received data in mutation:", data);
      console.log("Data length:", data?.length);
      
      const payload = { data };
      console.log("Sending payload:", payload);
      console.log("Payload JSON:", JSON.stringify(payload));
      
      const response = await apiRequest('/api/tree-species/import/csv', {
        method: 'POST',
        data: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log("API Response:", response);
      return response;
    },
    onSuccess: (response) => {
      toast({
        title: "Importación completada",
        description: response.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tree-species'] });
      setIsImportDialogOpen(false);
      setCsvPreview([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error en la importación",
        description: error.message || "Error al importar especies",
        variant: "destructive",
      });
    },
  });

  // Manejar exportación CSV
  const handleExportCsv = async () => {
    try {
      const response = await fetch('/api/tree-species/export/csv');
      if (!response.ok) {
        throw new Error('Error al exportar CSV');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'especies-arboreas.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Exportación exitosa",
        description: "El archivo CSV se ha descargado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No se pudo exportar el archivo CSV",
        variant: "destructive",
      });
    }
  };

  // Descargar plantilla CSV con ejemplos
  const handleDownloadTemplate = () => {
    const headers = [
      'nombre_comun',
      'nombre_cientifico', 
      'familia',
      'origen',
      'ritmo_crecimiento',
      'url_imagen',
      'amenazada',
      'descripcion',
      'beneficios_ecologicos',
      'requisitos_mantenimiento',
      'esperanza_vida',
      'zona_climatica',
      'requisitos_suelo',
      'requisitos_agua',
      'requisitos_sol',
      'valor_ornamental',
      'usos_comunes'
    ];

    const examples = [
      [
        'Ahuehuete',
        'Taxodium mucronatum',
        'Cupressaceae',
        'Nativo',
        'Medio',
        'https://ejemplo.com/ahuehuete.jpg',
        'no',
        'Árbol sagrado de México, de gran longevidad y porte majestuoso. Se caracteriza por su tronco grueso y su corteza fibrosa. Es el árbol nacional de México.',
        'Purifica el aire, proporciona sombra abundante, refugio para fauna, control de erosión, absorbe CO2',
        'Riego abundante los primeros años, poda de mantenimiento ocasional, fertilización anual',
        '500-1500 años',
        'Templado húmedo a subtropical',
        'Suelos húmedos, bien drenados, tolera encharcamiento temporal',
        'Abundante, tolera inundaciones estacionales',
        'Pleno sol a sombra parcial',
        'Alto - follaje denso, forma característica, corteza atractiva',
        'Ornamental, sombra, conservación de suelos, valor histórico y cultural'
      ],
      [
        'Jacaranda',
        'Jacaranda mimosifolia',
        'Bignoniaceae',
        'Introducido',
        'Rápido',
        'https://ejemplo.com/jacaranda.jpg',
        'no',
        'Árbol ornamental famoso por su espectacular floración violeta. Originario de Argentina, ampliamente cultivado en México por su belleza.',
        'Atrae polinizadores, proporciona sombra, mejora paisaje urbano',
        'Riego moderado, poda después de floración, fertilización en primavera',
        '50-100 años',
        'Subtropical a templado',
        'Bien drenados, tolera sequía una vez establecido',
        'Moderada, evitar encharcamiento',
        'Pleno sol',
        'Muy alto - floración espectacular, follaje delicado',
        'Ornamental, sombra en parques y avenidas, paisajismo'
      ]
    ];

    // Crear contenido CSV
    const csvContent = [
      headers.join(','),
      ...examples.map(row => 
        row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'plantilla-especies-arboreas.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Plantilla descargada",
      description: "La plantilla CSV con ejemplos se ha descargado correctamente",
    });
  };

  // Manejar selección de archivo CSV
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Archivo inválido",
        description: "Por favor selecciona un archivo CSV",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      const lines = csvText.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: "Archivo vacío",
          description: "El archivo CSV no contiene datos",
          variant: "destructive",
        });
        return;
      }

      // Parse CSV data
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        
        // Map CSV headers to expected fields
        headers.forEach((header, i) => {
          const value = values[i] || '';
          const normalizedHeader = header.toLowerCase().replace(/[_\s]/g, '');
          
          switch (normalizedHeader) {
            case 'nombrecomun':
            case 'nombrecomún':
            case 'commonname':
              row.commonName = value;
              break;
            case 'nombrecientifico':
            case 'nombrecientífico':
            case 'scientificname':
              row.scientificName = value;
              break;
            case 'familia':
            case 'family':
              row.family = value;
              break;
            case 'origen':
            case 'origin':
              row.origin = value;
              break;
            case 'ritmodecrecimiento':
            case 'ritmocrecimiento':
            case 'growthrate':
              row.growthRate = value;
              break;
            case 'amenazada':
            case 'isendangered':
            case 'endangered':
              row.isEndangered = value.toLowerCase() === 'sí' || value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
              break;
            case 'descripción':
            case 'descripcion':
            case 'description':
              row.description = value;
              break;
            case 'instruccionesdecuidado':
            case 'careinstructions':
              row.careInstructions = value;
              break;
            case 'beneficios':
            case 'beneficiosecologicos':
            case 'benefits':
              row.benefits = value;
              break;
            case 'urldeimagen':
            case 'imageurl':
            case 'urlimagen':
              row.imageUrl = value;
              break;
          }
        });
        
        return row;
      });

      setCsvPreview(data.slice(0, 5)); // Show first 5 rows for preview
      setIsImportDialogOpen(true);
    };

    reader.readAsText(file);
  };

  // Confirmar importación
  const handleConfirmImport = () => {
    if (csvPreview.length === 0) return;
    
    // Read the full file again for import
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      const lines = csvText.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        
        headers.forEach((header, i) => {
          const value = values[i] || '';
          switch (header.toLowerCase()) {
            case 'nombre común':
            case 'common_name':
              row.commonName = value;
              break;
            case 'nombre científico':
            case 'scientific_name':
              row.scientificName = value;
              break;
            case 'familia':
            case 'family':
              row.family = value;
              break;
            case 'origen':
            case 'origin':
              row.origin = value;
              break;
            case 'ritmo de crecimiento':
            case 'growth_rate':
              row.growthRate = value;
              break;
            case 'amenazada':
            case 'is_endangered':
              row.isEndangered = value.toLowerCase() === 'sí' || value.toLowerCase() === 'true';
              break;
            case 'descripción':
            case 'description':
              row.description = value;
              break;
            case 'instrucciones de cuidado':
            case 'care_instructions':
              row.careInstructions = value;
              break;
            case 'beneficios':
            case 'benefits':
              row.benefits = value;
              break;
            case 'url de imagen':
            case 'image_url':
              row.imageUrl = value;
              break;
          }
        });
        
        return row;
      });

      console.log("=== FRONTEND CSV DATA ===");
      console.log("Parsed data:", data);
      console.log("Data length:", data.length);
      console.log("First row:", data[0]);
      importMutation.mutate(data);
    };

    reader.readAsText(file);
  };

  // Manejar selección de archivos de iconos
  const handleIconFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Verificar que sean archivos de imagen
    const validFiles = Array.from(files).filter(file => {
      const isValid = file.type.startsWith('image/') && 
                     (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/svg+xml');
      if (!isValid) {
        toast({
          title: "Archivo inválido",
          description: `${file.name} no es un archivo de imagen válido`,
          variant: "destructive",
        });
      }
      return isValid;
    });

    if (validFiles.length > 0) {
      const fileList = new DataTransfer();
      validFiles.forEach(file => fileList.items.add(file));
      setSelectedIconFiles(fileList.files);
      setIsIconUploadDialogOpen(true);
    }
  };

  // Mutación para subida masiva de iconos
  const bulkIconUploadMutation = useMutation({
    mutationFn: async ({ files, family }: { files: FileList, family: string }) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('icons', file);
      });
      formData.append('family', family);

      const response = await fetch('/api/tree-species/bulk-upload-icons', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la carga masiva');
      }

      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Carga masiva completada",
        description: `${result.successCount} especies creadas/actualizadas exitosamente`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tree-species'] });
      setIsIconUploadDialogOpen(false);
      setSelectedIconFiles(null);
      setIconUploadFamily('general');
    },
    onError: (error: any) => {
      toast({
        title: "Error en la carga masiva",
        description: error.message || "Error al procesar los iconos",
        variant: "destructive",
      });
    },
  });

  // Confirmar subida de iconos
  const handleConfirmIconUpload = () => {
    if (!selectedIconFiles || selectedIconFiles.length === 0) return;
    
    setIsUploading(true);
    bulkIconUploadMutation.mutate({ 
      files: selectedIconFiles, 
      family: iconUploadFamily 
    });
  };

  // Mutación para eliminar especie
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/tree-species/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (response) => {
      toast({
        title: "Especie eliminada",
        description: response.message || "La especie ha sido eliminada correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tree-species'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar la especie",
        variant: "destructive",
      });
    },
  });

  // Manejar eliminación con confirmación
  const handleDelete = (species: TreeSpecies) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la especie "${species.commonName}"?\n\nEsta acción no se puede deshacer.`)) {
      deleteMutation.mutate(species.id);
    }
  };

  // Mutación para eliminar todas las especies
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/tree-species/delete-all', {
        method: 'DELETE',
      });
    },
    onSuccess: (response) => {
      toast({
        title: "Catálogo limpiado",
        description: response.message || "Todas las especies han sido eliminadas del catálogo",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tree-species'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al limpiar catálogo",
        description: error.message || "No se pudieron eliminar todas las especies",
        variant: "destructive",
      });
    },
  });

  // Manejar eliminación de todas las especies
  const handleDeleteAll = () => {
    deleteAllMutation.mutate();
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;
    
    const pages = [];
    const maxPages = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxPages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxPages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={pagination.page === i}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              aria-disabled={pagination.page <= 1}
              className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {pages}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              aria-disabled={pagination.page >= pagination.totalPages}
              className={pagination.page >= pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (error) {
    toast({
      title: "Error",
      description: "No se pudieron cargar las especies arbóreas. Por favor, intenta nuevamente.",
      variant: "destructive",
    });
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>Catálogo de Especies Arbóreas | ParquesMX</title>
        <meta name="description" content="Gestión y consulta del catálogo de especies arbóreas para parques y espacios públicos" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-800 flex items-center">
              <TreePine className="mr-2 h-8 w-8" />
              Catálogo de Especies Arbóreas
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona el catálogo de especies arbóreas para los parques y espacios públicos
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportCsv}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Download className="mr-2 h-4 w-4" /> Exportar CSV
            </Button>
            
            <Button
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas eliminar TODAS las especies del catálogo?\n\nEsta acción no se puede deshacer. Se recomienda exportar un respaldo antes de continuar.')) {
                  handleDeleteAll();
                }
              }}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Borrar Todas
            </Button>
            
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" /> Importar CSV
                </Button>
              </DialogTrigger>
            
            <Button
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
              onClick={() => iconFileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" /> Subir Iconos
            </Button>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Importar Especies desde CSV</DialogTitle>
                  <DialogDescription>
                    {csvPreview.length > 0 
                      ? "Vista previa de los primeros 5 registros. Confirma para importar todos los datos."
                      : "Selecciona un archivo CSV para importar especies o descarga la plantilla para ver el formato requerido."
                    }
                  </DialogDescription>
                </DialogHeader>
                
                {csvPreview.length === 0 && (
                  <div className="flex flex-col space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        ¿Primera vez importando especies? Descarga la plantilla con ejemplos para ver el formato correcto.
                      </p>
                      <Button
                        onClick={handleDownloadTemplate}
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-50"
                      >
                        <Download className="mr-2 h-4 w-4" /> Descargar Plantilla CSV
                      </Button>
                    </div>
                    <div className="text-center text-sm text-gray-500">
                      La plantilla incluye todas las columnas disponibles y dos ejemplos (Ahuehuete y Jacaranda)
                    </div>
                  </div>
                )}
                
                {csvPreview.length > 0 && (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre Común</TableHead>
                            <TableHead>Nombre Científico</TableHead>
                            <TableHead>Familia</TableHead>
                            <TableHead>Origen</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvPreview.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell>{row.commonName || 'N/A'}</TableCell>
                              <TableCell className="italic">{row.scientificName || 'N/A'}</TableCell>
                              <TableCell>{row.family || 'N/A'}</TableCell>
                              <TableCell>{row.origin || 'N/A'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsImportDialogOpen(false);
                          setCsvPreview([]);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleConfirmImport}
                        disabled={importMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {importMutation.isPending ? 'Importando...' : 'Confirmar Importación'}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            
            <Button onClick={handleCreateNew} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2 h-4 w-4" /> Nueva Especie
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        <input
          ref={iconFileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.svg"
          multiple
          style={{ display: 'none' }}
          onChange={handleIconFileSelect}
        />

        {/* Diálogo para subida masiva de iconos */}
        <Dialog open={isIconUploadDialogOpen} onOpenChange={setIsIconUploadDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Subir Iconos para Especies de Árboles</DialogTitle>
              <DialogDescription>
                Sube múltiples iconos para crear o actualizar especies de árboles automáticamente.
              </DialogDescription>
            </DialogHeader>
            
            {selectedIconFiles && (
              <div className="space-y-4">
                <div>
                  <Label>Archivos seleccionados: {selectedIconFiles.length}</Label>
                  <div className="mt-2 max-h-32 overflow-y-auto border rounded p-2">
                    {Array.from(selectedIconFiles).map((file, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {file.name}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="family">Familia de árboles</Label>
                  <Select value={iconUploadFamily} onValueChange={setIconUploadFamily}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una familia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="pinus">Pinus (Pinos)</SelectItem>
                      <SelectItem value="quercus">Quercus (Robles)</SelectItem>
                      <SelectItem value="ficus">Ficus</SelectItem>
                      <SelectItem value="jacaranda">Jacaranda</SelectItem>
                      <SelectItem value="fraxinus">Fraxinus (Fresnos)</SelectItem>
                      <SelectItem value="eucalyptus">Eucalyptus</SelectItem>
                      <SelectItem value="palmae">Palmae (Palmas)</SelectItem>
                      <SelectItem value="citrus">Citrus (Cítricos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsIconUploadDialogOpen(false);
                      setSelectedIconFiles(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleConfirmIconUpload}
                    disabled={bulkIconUploadMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {bulkIconUploadMutation.isPending ? 'Subiendo...' : 'Subir Iconos'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Filtros y Búsqueda</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre común, científico o familia..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <Select
                  value={originFilter}
                  onValueChange={setOriginFilter}
                >
                  <SelectTrigger className="w-full">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Origen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los orígenes</SelectItem>
                    <SelectItem value="Nativo">Nativo</SelectItem>
                    <SelectItem value="Introducido">Introducido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-48">
                <Select
                  value={sortBy}
                  onValueChange={setSortBy}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common_name">Nombre Común</SelectItem>
                    <SelectItem value="scientific_name">Nombre Científico</SelectItem>
                    <SelectItem value="origin">Origen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-48">
                <Select
                  value={sortOrder}
                  onValueChange={setSortOrder}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Dirección" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascendente</SelectItem>
                    <SelectItem value="desc">Descendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full md:w-auto">
                <Search className="mr-2 h-4 w-4" /> Buscar
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : species.length === 0 ? (
              <div className="text-center py-8">
                <Leaf className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No se encontraron especies arbóreas</h3>
                <p className="mt-1 text-gray-500">
                  Prueba con otros términos de búsqueda o agrega nuevas especies al catálogo.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} especies
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileSpreadsheet className="h-4 w-4" />
                    Página {pagination.page} de {pagination.totalPages}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">Icono</TableHead>
                        <TableHead>Nombre Común</TableHead>
                        <TableHead>Nombre Científico</TableHead>
                        <TableHead>Familia</TableHead>
                        <TableHead>Origen</TableHead>
                        <TableHead>Crecimiento</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {species.map((species) => (
                        <TableRow key={species.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewDetails(species.id)}>
                          <TableCell>
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-50">
                              <TreeSpeciesIcon
                                name={species.commonName}
                                iconType={species.iconType || 'system'}
                                customIconUrl={species.customIconUrl}
                                size={32}
                                className="text-green-600"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{species.commonName}</TableCell>
                          <TableCell className="italic">{species.scientificName}</TableCell>
                          <TableCell>{species.family}</TableCell>
                          <TableCell>
                            <Badge variant={species.origin === 'Nativo' ? 'default' : 'outline'}>
                              {species.origin}
                            </Badge>
                          </TableCell>
                          <TableCell>{species.growthRate}</TableCell>
                          <TableCell>
                            {species.isEndangered ? (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <CircleAlert className="h-3 w-3" /> Amenazada
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="flex items-center gap-1 text-green-600 bg-green-50">
                                <CircleCheck className="h-3 w-3" /> Normal
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(species.id);
                                }}
                                className="text-green-600 hover:text-green-800 hover:bg-green-50"
                              >
                                <Eye className="h-4 w-4 mr-1" /> Ver
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(species);
                                }}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> 
                                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            {renderPagination()}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default TreeSpeciesCatalog;