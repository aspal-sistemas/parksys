import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Settings, Calculator, DollarSign, Percent, Package, MapPin, Edit, Trash2, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Schema definitions
const paymentConfigSchema = z.object({
  contractId: z.number(),
  configName: z.string().min(1, "Nombre requerido"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  hasMinimumGuarantee: z.boolean().default(false),
  minimumGuaranteeAmount: z.string().optional(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().optional(),
});

const chargeSchema = z.object({
  paymentConfigId: z.number().optional(),
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().optional(),
  chargeType: z.enum(["fixed", "percentage", "per_unit", "per_m2"]),
  fixedAmount: z.string().optional(),
  percentage: z.string().optional(),
  perUnitAmount: z.string().optional(),
  unitType: z.string().optional(),
  perM2Amount: z.string().optional(),
  spaceM2: z.string().optional(),
  isActive: z.boolean().default(true),
  appliesFromDay: z.number().min(1).max(31).optional(),
  appliesFromMonth: z.number().min(1).max(12).optional(),
});

type PaymentConfigFormValues = z.infer<typeof paymentConfigSchema>;
type ChargeFormValues = z.infer<typeof chargeSchema>;

interface ContractPaymentConfig {
  id: number;
  contractId: number;
  configName: string;
  description?: string;
  isActive: boolean;
  hasMinimumGuarantee: boolean;
  minimumGuaranteeAmount?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
}

interface ContractCharge {
  id: number;
  paymentConfigId: number;
  name: string;
  description?: string;
  chargeType: string;
  fixedAmount?: string;
  percentage?: string;
  perUnitAmount?: string;
  unitType?: string;
  perM2Amount?: string;
  spaceM2?: string;
  isActive: boolean;
  appliesFromDay?: number;
  appliesFromMonth?: number;
  createdAt: string;
  updatedAt: string;
}

interface Contract {
  id: number;
  contractNumber: string;
  concessionaireName: string;
  serviceName: string;
  status: string;
}

export default function HybridPaymentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedContract, setSelectedContract] = useState<number | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<number | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [isChargeDialogOpen, setIsChargeDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ContractPaymentConfig | null>(null);
  const [editingCharge, setEditingCharge] = useState<ContractCharge | null>(null);

  // Fetch contracts
  const { data: contracts = [] } = useQuery<Contract[]>({
    queryKey: ["/api/concession-contracts"],
  });

  // Fetch payment configurations
  const { data: paymentConfigs = [] } = useQuery<ContractPaymentConfig[]>({
    queryKey: ["/api/hybrid-payments/configs", selectedContract],
    enabled: !!selectedContract,
  });

  // Fetch charges for selected config
  const { data: charges = [] } = useQuery<ContractCharge[]>({
    queryKey: ["/api/hybrid-payments/charges", selectedConfig],
    enabled: !!selectedConfig,
  });

  // Payment calculation
  const { data: paymentCalculation, refetch: refetchCalculation } = useQuery<any>({
    queryKey: ["/api/hybrid-payments/calculate", selectedContract, selectedConfig],
    enabled: !!selectedContract && !!selectedConfig,
  });

  // Create payment config mutation
  const createConfigMutation = useMutation({
    mutationFn: (data: PaymentConfigFormValues) => 
      apiRequest("/api/hybrid-payments/configs", {
        method: "POST",
        data: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hybrid-payments/configs"] });
      setIsConfigDialogOpen(false);
      toast({ title: "Configuración creada exitosamente" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Error al crear configuración",
        variant: "destructive" 
      });
    },
  });

  // Create charge mutation
  const createChargeMutation = useMutation({
    mutationFn: (data: ChargeFormValues) => 
      apiRequest("/api/hybrid-payments/charges", {
        method: "POST",
        data: { ...data, paymentConfigId: selectedConfig },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hybrid-payments/charges"] });
      setIsChargeDialogOpen(false);
      toast({ title: "Cargo creado exitosamente" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Error al crear cargo",
        variant: "destructive" 
      });
    },
  });

  // Payment config form
  const configForm = useForm<PaymentConfigFormValues>({
    resolver: zodResolver(paymentConfigSchema),
    defaultValues: {
      contractId: selectedContract || 0,
      configName: "",
      description: "",
      isActive: true,
      hasMinimumGuarantee: false,
      effectiveFrom: new Date().toISOString().split('T')[0],
    },
  });

  // Charge form
  const chargeForm = useForm<ChargeFormValues>({
    resolver: zodResolver(chargeSchema),
    defaultValues: {
      name: "",
      description: "",
      chargeType: "fixed",
      isActive: true,
    },
  });

  const onConfigSubmit = (data: PaymentConfigFormValues) => {
    createConfigMutation.mutate({ ...data, contractId: selectedContract! });
  };

  const onChargeSubmit = (data: ChargeFormValues) => {
    createChargeMutation.mutate(data);
  };

  const getChargeTypeIcon = (type: string) => {
    switch (type) {
      case "fixed": return <DollarSign className="h-4 w-4" />;
      case "percentage": return <Percent className="h-4 w-4" />;
      case "per_unit": return <Package className="h-4 w-4" />;
      case "per_m2": return <MapPin className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getChargeTypeLabel = (type: string) => {
    switch (type) {
      case "fixed": return "Monto Fijo";
      case "percentage": return "Porcentaje";
      case "per_unit": return "Por Unidad";
      case "per_m2": return "Por M²";
      default: return type;
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Sistema de Cobro Híbrido - ParkSys</title>
        <meta name="description" content="Configure métodos de cobro flexibles y combinables para contratos de concesión" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sistema de Cobro Híbrido</h1>
            <p className="text-muted-foreground">
              Configure métodos de cobro flexibles y combinables para contratos de concesión
            </p>
          </div>
        </div>

        {/* Contract Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Selección de Contrato
          </CardTitle>
          <CardDescription>
            Seleccione el contrato para configurar el sistema de cobro híbrido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedContract?.toString()} onValueChange={(value) => {
            setSelectedContract(parseInt(value));
            setSelectedConfig(null);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar contrato..." />
            </SelectTrigger>
            <SelectContent>
              {contracts.map((contract) => (
                <SelectItem key={contract.id} value={contract.id.toString()}>
                  {contract.contractNumber} - {contract.concessionaireName} ({contract.serviceName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedContract && (
        <Tabs defaultValue="configurations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="configurations">Configuraciones</TabsTrigger>
            <TabsTrigger value="charges">Cargos</TabsTrigger>
            <TabsTrigger value="calculation">Calculadora</TabsTrigger>
          </TabsList>

          {/* Payment Configurations Tab */}
          <TabsContent value="configurations">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Configuraciones de Cobro</CardTitle>
                    <CardDescription>
                      Gestione las configuraciones de cobro para este contrato
                    </CardDescription>
                  </div>
                  <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Configuración
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Nueva Configuración de Cobro</DialogTitle>
                        <DialogDescription>
                          Configure los parámetros básicos del sistema de cobro
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...configForm}>
                        <form onSubmit={configForm.handleSubmit(onConfigSubmit)} className="space-y-4">
                          <FormField
                            control={configForm.control}
                            name="configName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre de la Configuración</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ej: Configuración Principal 2024" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={configForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                  <Input placeholder="Descripción opcional..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={configForm.control}
                              name="effectiveFrom"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Vigente Desde</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={configForm.control}
                              name="effectiveTo"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Vigente Hasta</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={configForm.control}
                            name="hasMinimumGuarantee"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Garantía Mínima</FormLabel>
                                  <FormDescription>
                                    Establece un monto mínimo garantizado por período
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {configForm.watch("hasMinimumGuarantee") && (
                            <FormField
                              control={configForm.control}
                              name="minimumGuaranteeAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Monto Mínimo Garantizado</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          <FormField
                            control={configForm.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Configuración Activa</FormLabel>
                                  <FormDescription>
                                    La configuración estará activa y aplicable
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                              Cancelar
                            </Button>
                            <Button type="submit" disabled={createConfigMutation.isPending}>
                              {createConfigMutation.isPending ? "Creando..." : "Crear Configuración"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentConfigs.map((config) => (
                    <Card key={config.id} className={`cursor-pointer transition-colors ${
                      selectedConfig === config.id ? "ring-2 ring-[#00a587]" : ""
                    }`} onClick={() => setSelectedConfig(config.id)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{config.configName}</h3>
                              <Badge variant={config.isActive ? "default" : "secondary"}>
                                {config.isActive ? "Activa" : "Inactiva"}
                              </Badge>
                              {config.hasMinimumGuarantee && (
                                <Badge variant="outline" className="text-[#00a587]">
                                  Garantía Mínima
                                </Badge>
                              )}
                            </div>
                            {config.description && (
                              <p className="text-sm text-muted-foreground">{config.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Vigente desde {new Date(config.effectiveFrom).toLocaleDateString()}
                              {config.effectiveTo && ` hasta ${new Date(config.effectiveTo).toLocaleDateString()}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {paymentConfigs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay configuraciones de cobro para este contrato.
                      <br />
                      Cree una nueva configuración para comenzar.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Charges Tab */}
          <TabsContent value="charges">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cargos de Cobro</CardTitle>
                    <CardDescription>
                      Configure los diferentes tipos de cargos para la configuración seleccionada
                    </CardDescription>
                  </div>
                  <Dialog open={isChargeDialogOpen} onOpenChange={setIsChargeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button disabled={!selectedConfig}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Cargo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Nuevo Cargo de Cobro</DialogTitle>
                        <DialogDescription>
                          Configure un nuevo método de cobro para esta configuración
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...chargeForm}>
                        <form onSubmit={chargeForm.handleSubmit(onChargeSubmit)} className="space-y-4">
                          <FormField
                            control={chargeForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre del Cargo</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ej: Renta Base Mensual" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={chargeForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                  <Input placeholder="Descripción del cargo..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={chargeForm.control}
                            name="chargeType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Cargo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar tipo de cargo..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="fixed">Monto Fijo</SelectItem>
                                    <SelectItem value="percentage">Porcentaje de Ventas</SelectItem>
                                    <SelectItem value="per_unit">Por Unidad Vendida</SelectItem>
                                    <SelectItem value="per_m2">Renta por M²</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Conditional fields based on charge type */}
                          {chargeForm.watch("chargeType") === "fixed" && (
                            <FormField
                              control={chargeForm.control}
                              name="fixedAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Monto Fijo</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          {chargeForm.watch("chargeType") === "percentage" && (
                            <FormField
                              control={chargeForm.control}
                              name="percentage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Porcentaje (%)</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          {chargeForm.watch("chargeType") === "per_unit" && (
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={chargeForm.control}
                                name="perUnitAmount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Monto por Unidad</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={chargeForm.control}
                                name="unitType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tipo de Unidad</FormLabel>
                                    <FormControl>
                                      <Input placeholder="productos, servicios, etc." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}

                          {chargeForm.watch("chargeType") === "per_m2" && (
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={chargeForm.control}
                                name="perM2Amount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Monto por M²</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={chargeForm.control}
                                name="spaceM2"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Espacio en M²</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={chargeForm.control}
                              name="appliesFromDay"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Aplica desde el día</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="1" max="31" placeholder="1" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={chargeForm.control}
                              name="appliesFromMonth"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Aplica desde el mes</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="1" max="12" placeholder="1" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={chargeForm.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Cargo Activo</FormLabel>
                                  <FormDescription>
                                    El cargo estará activo y se aplicará en los cálculos
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsChargeDialogOpen(false)}>
                              Cancelar
                            </Button>
                            <Button type="submit" disabled={createChargeMutation.isPending}>
                              {createChargeMutation.isPending ? "Creando..." : "Crear Cargo"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {selectedConfig ? (
                  <div className="space-y-4">
                    {charges.map((charge) => (
                      <Card key={charge.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {getChargeTypeIcon(charge.chargeType)}
                                <h3 className="font-semibold">{charge.name}</h3>
                                <Badge variant="outline">
                                  {getChargeTypeLabel(charge.chargeType)}
                                </Badge>
                                <Badge variant={charge.isActive ? "default" : "secondary"}>
                                  {charge.isActive ? "Activo" : "Inactivo"}
                                </Badge>
                              </div>
                              {charge.description && (
                                <p className="text-sm text-muted-foreground">{charge.description}</p>
                              )}
                              <div className="text-sm text-muted-foreground">
                                {charge.chargeType === "fixed" && `Monto: $${charge.fixedAmount}`}
                                {charge.chargeType === "percentage" && `Porcentaje: ${charge.percentage}%`}
                                {charge.chargeType === "per_unit" && `Por ${charge.unitType}: $${charge.perUnitAmount}`}
                                {charge.chargeType === "per_m2" && `Por M²: $${charge.perM2Amount} (${charge.spaceM2} M²)`}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {charges.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No hay cargos configurados para esta configuración.
                        <br />
                        Cree un nuevo cargo para comenzar.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Seleccione una configuración de cobro para ver y gestionar sus cargos.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Calculation Tab */}
          <TabsContent value="calculation">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Calculadora de Pagos
                    </CardTitle>
                    <CardDescription>
                      Calcule el monto a pagar basado en la configuración y cargos seleccionados
                    </CardDescription>
                  </div>
                  <Button onClick={() => refetchCalculation()} disabled={!selectedConfig}>
                    Calcular Pago
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedConfig && paymentCalculation ? (
                  <div className="space-y-6">
                    {/* Payment Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-[#00a587]">
                            ${paymentCalculation.finalAmount?.toFixed(2) || "0.00"}
                          </div>
                          <div className="text-sm text-muted-foreground">Monto Final</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold">
                            ${paymentCalculation.subtotal?.toFixed(2) || "0.00"}
                          </div>
                          <div className="text-sm text-muted-foreground">Subtotal</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            ${paymentCalculation.minimumGuaranteeAdjustment?.toFixed(2) || "0.00"}
                          </div>
                          <div className="text-sm text-muted-foreground">Ajuste Garantía</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Calculation Details */}
                    {paymentCalculation.calculationDetails && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Desglose del Cálculo</h3>
                        <div className="space-y-2">
                          {paymentCalculation.calculationDetails.charges?.map((charge: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-muted rounded">
                              <div>
                                <div className="font-medium">{charge.name}</div>
                                <div className="text-sm text-muted-foreground">{charge.type}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">${charge.amount?.toFixed(2) || "0.00"}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {paymentCalculation.minimumGuaranteeApplied && (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-orange-600">
                            Garantía Mínima Aplicada
                          </Badge>
                        </div>
                        <p className="text-sm text-orange-700 mt-2">
                          El subtotal está por debajo de la garantía mínima. Se aplicó un ajuste de ${paymentCalculation.minimumGuaranteeAdjustment?.toFixed(2)}.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Seleccione una configuración de cobro para calcular el pago.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      </div>
    </AdminLayout>
  );
}