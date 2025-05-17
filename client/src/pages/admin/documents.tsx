import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

const AdminDocuments = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPark, setFilterPark] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [sortField, setSortField] = useState<string>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  return (
    <AdminLayout title="Administración de Documentos">
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Documentos</h2>
          <Button>
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
    </AdminLayout>
  );
};

export default AdminDocuments;