import React, { useState, useEffect } from 'react';
import { Check, Clock, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Schedule {
  id: string;
  days: string[];
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface ScheduleConfigurationProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Lunes', short: 'L' },
  { id: 'tuesday', label: 'Martes', short: 'M' },
  { id: 'wednesday', label: 'Miércoles', short: 'X' },
  { id: 'thursday', label: 'Jueves', short: 'J' },
  { id: 'friday', label: 'Viernes', short: 'V' },
  { id: 'saturday', label: 'Sábado', short: 'S' },
  { id: 'sunday', label: 'Domingo', short: 'D' }
];

export const ScheduleConfiguration: React.FC<ScheduleConfigurationProps> = ({
  value = '',
  onChange,
  className = ''
}) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState<Partial<Schedule>>({
    days: [],
    openTime: '09:00',
    closeTime: '18:00',
    isClosed: false
  });

  // Parse initial value if provided
  useEffect(() => {
    if (value && value !== '') {
      try {
        const parsed = parseScheduleString(value);
        setSchedules(parsed);
      } catch (error) {
        console.log('Error parsing schedule:', error);
        // If parsing fails, create a default schedule from the text
        setSchedules([{
          id: Date.now().toString(),
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          openTime: '06:00',
          closeTime: '22:00',
          isClosed: false
        }]);
      }
    }
  }, [value]);

  const parseScheduleString = (scheduleStr: string): Schedule[] => {
    // Simple parser for common formats like "Lunes a Domingo de 6:00 a 22:00"
    // This is a basic implementation - can be enhanced based on needs
    const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Extract time if present
    const timeMatch = scheduleStr.match(/(\d{1,2}):?(\d{2})?\s*(?:a|-)?\s*(\d{1,2}):?(\d{2})?/);
    let openTime = '09:00';
    let closeTime = '18:00';
    
    if (timeMatch) {
      const openHour = timeMatch[1].padStart(2, '0');
      const openMin = timeMatch[2] || '00';
      const closeHour = timeMatch[3].padStart(2, '0');
      const closeMin = timeMatch[4] || '00';
      
      openTime = `${openHour}:${openMin}`;
      closeTime = `${closeHour}:${closeMin}`;
    }

    return [{
      id: Date.now().toString(),
      days: allDays,
      openTime,
      closeTime,
      isClosed: false
    }];
  };

  const addSchedule = () => {
    if (currentSchedule.days && currentSchedule.days.length > 0) {
      const newSchedule: Schedule = {
        id: Date.now().toString(),
        days: currentSchedule.days,
        openTime: currentSchedule.openTime || '09:00',
        closeTime: currentSchedule.closeTime || '18:00',
        isClosed: currentSchedule.isClosed || false
      };
      
      const newSchedules = [...schedules, newSchedule];
      setSchedules(newSchedules);
      updateParentValue(newSchedules);
      
      // Reset current schedule
      setCurrentSchedule({
        days: [],
        openTime: '09:00',
        closeTime: '18:00',
        isClosed: false
      });
    }
  };

  const removeSchedule = (id: string) => {
    const newSchedules = schedules.filter(s => s.id !== id);
    setSchedules(newSchedules);
    updateParentValue(newSchedules);
  };

  const updateParentValue = (newSchedules: Schedule[]) => {
    const scheduleString = formatSchedulesToString(newSchedules);
    onChange(scheduleString);
  };

  const formatSchedulesToString = (schedules: Schedule[]): string => {
    if (schedules.length === 0) return '';
    
    return schedules.map(schedule => {
      const dayLabels = schedule.days.map(dayId => 
        DAYS_OF_WEEK.find(d => d.id === dayId)?.label || dayId
      );
      
      if (schedule.isClosed) {
        return `${dayLabels.join(', ')}: Cerrado`;
      }
      
      return `${dayLabels.join(', ')}: ${schedule.openTime} - ${schedule.closeTime}`;
    }).join(' | ');
  };

  const toggleDay = (dayId: string) => {
    const currentDays = currentSchedule.days || [];
    const newDays = currentDays.includes(dayId)
      ? currentDays.filter(d => d !== dayId)
      : [...currentDays, dayId];
    
    setCurrentSchedule({ ...currentSchedule, days: newDays });
  };

  const getDayLabel = (dayId: string) => {
    return DAYS_OF_WEEK.find(d => d.id === dayId)?.label || dayId;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Schedules */}
      {schedules.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Horarios configurados:</Label>
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {schedule.days.map(dayId => (
                      <Badge key={dayId} variant="secondary" className="text-xs">
                        {DAYS_OF_WEEK.find(d => d.id === dayId)?.short}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    {schedule.isClosed ? (
                      <span className="text-red-600 font-medium">Cerrado</span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {schedule.openTime} - {schedule.closeTime}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSchedule(schedule.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Schedule */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Agregar horario</CardTitle>
          <CardDescription>
            Configure los días y horarios de apertura del parque
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Days Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Días de la semana:</Label>
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.id} className="flex flex-col items-center">
                  <Checkbox
                    id={day.id}
                    checked={currentSchedule.days?.includes(day.id) || false}
                    onCheckedChange={() => toggleDay(day.id)}
                  />
                  <Label
                    htmlFor={day.id}
                    className="text-xs mt-1 text-center cursor-pointer"
                  >
                    {day.short}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Closed Toggle */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isClosed"
              checked={currentSchedule.isClosed || false}
              onCheckedChange={(checked) => 
                setCurrentSchedule({ ...currentSchedule, isClosed: checked as boolean })
              }
            />
            <Label htmlFor="isClosed" className="text-sm">
              Cerrado estos días
            </Label>
          </div>

          {/* Time Selection */}
          {!currentSchedule.isClosed && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="openTime" className="text-sm font-medium">
                  Hora de apertura
                </Label>
                <Input
                  id="openTime"
                  type="time"
                  value={currentSchedule.openTime || '09:00'}
                  onChange={(e) => 
                    setCurrentSchedule({ ...currentSchedule, openTime: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="closeTime" className="text-sm font-medium">
                  Hora de cierre
                </Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={currentSchedule.closeTime || '18:00'}
                  onChange={(e) => 
                    setCurrentSchedule({ ...currentSchedule, closeTime: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Add Button */}
          <Button
            onClick={addSchedule}
            disabled={!currentSchedule.days || currentSchedule.days.length === 0}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar horario
          </Button>
        </CardContent>
      </Card>

      {/* Quick Presets */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Configuraciones rápidas:</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const preset: Schedule = {
                id: Date.now().toString(),
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                openTime: '06:00',
                closeTime: '22:00',
                isClosed: false
              };
              const newSchedules = [preset];
              setSchedules(newSchedules);
              updateParentValue(newSchedules);
            }}
          >
            Todos los días 6:00-22:00
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const weekdays: Schedule = {
                id: Date.now().toString(),
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                openTime: '07:00',
                closeTime: '19:00',
                isClosed: false
              };
              const weekends: Schedule = {
                id: (Date.now() + 1).toString(),
                days: ['saturday', 'sunday'],
                openTime: '08:00',
                closeTime: '20:00',
                isClosed: false
              };
              const newSchedules = [weekdays, weekends];
              setSchedules(newSchedules);
              updateParentValue(newSchedules);
            }}
          >
            Lun-Vie 7:00-19:00, Sáb-Dom 8:00-20:00
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleConfiguration;