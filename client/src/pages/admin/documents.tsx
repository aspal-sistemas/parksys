import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash, FileText, ArrowUpDown, X, Search, Loader, Download } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Document, Park } from '@shared/schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Esquema de validación para el formulario de documentos
const documentFormSchema = z.object({
  parkId: z.string().min(1, 'Seleccione un parque'),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  // Permitimos que fileUrl sea opcional cuando se carga un archivo
  fileUrl: z.string().url('Ingrese una URL válida').optional(),
  // Campo para cargar archivo
  file: z
    .instanceof(File, { message: "Por favor, seleccione un archivo" })
    .optional(),
  fileSize: z.string().min(1, 'Ingrese el tamaño del archivo').optional(),
  fileType: z.string().min(1, 'Seleccione un tipo de archivo').optional(),
}).refine(data => data.fileUrl || data.file, {
  message: "Debe proporcionar una URL de archivo o cargar un archivo",
  path: ["file"], // mensaje de error en el campo 'file'
});

// Tipos para el formulario
type DocumentFormValues = z.infer<typeof documentFormSchema>;

const AdminDocuments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPark, setFilterPark] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [sortField, setSortField] = useState<string>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch all documents
  const { 
    data: documents = [], 
    isLoading: isLoadingDocuments,
    isError: isErrorDocuments,
    refetch: refetchDocuments
  } = useQuery({
    queryKey: ['/api/documents'],
  });

  // Fetch parks for filter
  const { 
    data: parks = [], 
    isLoading: isLoadingParks 
  } = useQuery({
    queryKey: ['/api/parks'],
  });

  // Get unique file types from documents
  const fileTypes = React.useMemo(() => {
    const uniqueTypes = new Set<string>();
    documents.forEach(doc => {
      if (doc.fileType) {
        // Get type without charset, etc.
        const mainType = doc.fileType.split(';')[0].trim();
        uniqueTypes.add(mainType);
      }
    });
    return Array.from(uniqueTypes);
  }, [documents]);

  // Get file type display name
  const getFileTypeLabel = (type: string | null) => {
    if (!type) return 'Desconocido';
    
    const typeMap: Record<string, string> = {
      'application/pdf': 'PDF',
      'application/msword': 'Word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
      'application/vnd.ms-excel': 'Excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
      'image/jpeg': 'Imagen JPEG',
      'image/png': 'Imagen PNG',
      'text/plain': 'Texto plano'
    };
    
    return typeMap[type] || type;
  };

  // Filter and sort documents
  const filteredDocuments = React.useMemo(() => {
    return [...documents].filter(document => {
      // Apply search filter
      if (searchQuery && !document.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply park filter
      if (filterPark && document.parkId.toString() !== filterPark) {
        return false;
      }
      
      // Apply file type filter
      if (filterType && document.fileType && !document.fileType.includes(filterType)) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Apply sorting
      if (sortField === 'title') {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      }
      
      if (sortField === 'fileType') {
        const typeA = getFileTypeLabel(a.fileType);
        const typeB = getFileTypeLabel(b.fileType);
        return sortDirection === 'asc' 
          ? typeA.localeCompare(typeB) 
          : typeB.localeCompare(typeA);
      }
      
      // Default sort by title
      return a.title.localeCompare(b.title);
    });
  }, [documents, searchQuery, filterPark, filterType, sortField, sortDirection]);

  // Get park name by ID
  const getParkName = (parkId: number) => {
    const park = parks.find(p => p.id === parkId);
    return park ? park.name : 'Desconocido';
  };

  // Get file icon based on type
  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-4 w-4 text-gray-500" />;
    
    if (fileType.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('wordprocessing')) {
      return <FileText className="h-4 w-4 text-blue-500" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileText className="h-4 w-4 text-green-500" />;
    } else if (fileType.includes('image')) {
      return <FileText className="h-4 w-4 text-purple-500" />;
    }
    
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  // Format file size for display
  const formatFileSize = (fileSize: string | null) => {
    if (!fileSize) return 'Desconocido';
    return fileSize;
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;
    
    try {
      await fetch(`/api/parks/${documentToDelete.parkId}/documents/${documentToDelete.id}`, {
        method: 'DELETE',
      });
      
      // Refetch documents
      refetchDocuments();
      
      // Show success toast
      toast({
        title: "Documento eliminado",
        description: `El documento ${documentToDelete.title} ha sido eliminado exitosamente.`,
      });
      
      // Close dialog and reset state
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Handle opening delete dialog
  const handleDeleteClick = (document: Document) => {
    setDocumentToDelete(document);
    setShowDeleteDialog(true);
  };

  // Handle sort toggle
  const handleSortToggle = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterPark('');
    setFilterType('');
  };
  
  // Crear formulario para agregar documentos
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      parkId: '',
      title: '',
      fileUrl: '',
      fileSize: '',
      fileType: '',
    },
  });
  
  // Función para subir un archivo al servidor
  const uploadFile = async (file: File): Promise<string> => {
    try {
      // Crear un FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', file);
      
      // Implementación simulada - En producción, integrar con servicio de almacenamiento real
      // Simular una URL temporal para fines de demostración
      // NOTA: Esta es una simulación para la demostración. En un entorno real,
      // se utilizaría un servicio de almacenamiento como AWS S3, Google Cloud Storage, etc.
      return `https://storage.example.com/documents/${file.name}`;
      
      /* Ejemplo de código real para subir a un servicio de almacenamiento:
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Error al subir el archivo');
      }
      
      const result = await response.json();
      return result.fileUrl;
      */
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      throw new Error('No se pudo subir el archivo. Intente nuevamente.');
    }
  };

  // Manejar submit del formulario
  const handleSubmit = async (data: DocumentFormValues) => {
    try {
      let fileUrl = data.fileUrl;
      
      // Si se seleccionó un archivo para cargar, lo subimos primero
      if (data.file) {
        setIsUploading(true);
        try {
          fileUrl = await uploadFile(data.file);
        } catch (error) {
          console.error('Error al subir el archivo:', error);
          toast({
            title: 'Error',
            description: 'No se pudo subir el archivo. Intente nuevamente.',
            variant: 'destructive',
          });
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }
      
      // Una vez que tenemos la URL (cargada o ingresada), creamos el documento
      const response = await fetch(`/api/parks/${data.parkId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          fileUrl: fileUrl,
          fileSize: data.fileSize,
          fileType: data.fileType,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al crear el documento');
      }
      
      // Actualizar la lista de documentos
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      
      // Cerrar el diálogo y resetear el formulario
      setShowAddDialog(false);
      form.reset();
      
      // Mostrar toast de éxito
      toast({
        title: 'Documento agregado',
        description: 'El documento se ha agregado correctamente.',
      });
    } catch (error) {
      console.error('Error al agregar documento:', error);
      toast({
        title: 'Error',
        description: 'No se pudo agregar el documento. Intente nuevamente.',
        variant: 'destructive',
      });
    }
  };

  const fileTypeOptions = [
    { value: 'application/pdf', label: 'PDF' },
    { value: 'application/msword', label: 'Word' },
    { value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'Word (DOCX)' },
    { value: 'application/vnd.ms-excel', label: 'Excel' },
    { value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', label: 'Excel (XLSX)' },
    { value: 'image/jpeg', label: 'Imagen JPEG' },
    { value: 'image/png', label: 'Imagen PNG' },
    { value: 'text/plain', label: 'Texto plano' },
  ];

  return (
    <AdminLayout title="Administración de Documentos">
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Documentos</h2>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Documento
          </Button>
        </div>
        
        {/* Search and filter bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar documentos..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={filterPark} onValueChange={setFilterPark}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Parque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los parques</SelectItem>
              {parks.map(park => (
                <SelectItem key={park.id} value={park.id.toString()}>
                  {park.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tipo de archivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {fileTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {getFileTypeLabel(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {(searchQuery || filterPark || filterType) && (
            <Button variant="ghost" onClick={handleClearFilters} aria-label="Limpiar filtros">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Documents table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoadingDocuments ? (
            <div className="py-32 flex justify-center">
              <div className="flex flex-col items-center">
                <Loader className="h-8 w-8 text-primary animate-spin mb-2" />
                <p className="text-gray-500">Cargando documentos...</p>
              </div>
            </div>
          ) : isErrorDocuments ? (
            <div className="py-32 flex justify-center">
              <div className="text-center">
                <p className="text-red-500 mb-2">Error al cargar los documentos</p>
                <Button variant="outline" onClick={() => refetchDocuments()}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-32 flex justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">No se encontraron documentos</p>
                {(searchQuery || filterPark || filterType) && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center"
                      onClick={() => handleSortToggle('title')}
                    >
                      Título
                      {sortField === 'title' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center"
                      onClick={() => handleSortToggle('fileType')}
                    >
                      Tipo
                      {sortField === 'fileType' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Parque</TableHead>
                  <TableHead className="w-[100px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map(document => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">{document.id}</TableCell>
                    <TableCell className="flex items-center">
                      {getFileIcon(document.fileType)}
                      <span className="ml-2">{document.title}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-100">
                        {getFileTypeLabel(document.fileType)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(document.fileSize)}</TableCell>
                    <TableCell>{getParkName(document.parkId)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <a 
                        href={document.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4 text-blue-500" />
                        </Button>
                      </a>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4 text-yellow-500" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDeleteClick(document)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>
              ¿Está seguro que desea eliminar el documento <span className="font-semibold">{documentToDelete?.title}</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para agregar documentos */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar nuevo documento</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="parkId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parque</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar parque" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {parks.map((park) => (
                          <SelectItem key={park.id} value={park.id.toString()}>
                            {park.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del documento</FormLabel>
                    <FormControl>
                      <Input placeholder="Reglamento Interno" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Seleccione una opción:</h3>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="fileUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL del archivo (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/documento.pdf" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="- o -">
                    <div className="flex items-center">
                      <div className="flex-grow h-px bg-gray-200"></div>
                      <span className="px-2 text-sm text-gray-400">O</span>
                      <div className="flex-grow h-px bg-gray-200"></div>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field: { onChange, value, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Cargar archivo (opcional)</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            {...fieldProps}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                onChange(file);
                                // Auto-detectar el tipo de archivo
                                form.setValue('fileType', file.type);
                                // Auto-detectar el tamaño del archivo
                                const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
                                form.setValue('fileSize', `${fileSizeInMB} MB`);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="fileSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamaño del archivo</FormLabel>
                    <FormControl>
                      <Input placeholder="2.5 MB" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fileType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de archivo</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo de archivo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {fileTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    'Guardar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminDocuments;