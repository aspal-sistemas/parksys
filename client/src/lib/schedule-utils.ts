/**
 * Utility functions for handling park schedule formatting and display
 */

export interface ParsedSchedule {
  is24_7: boolean;
  isClosed: boolean;
  schedules: Array<{
    days: string[];
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
}

/**
 * Formats a schedule string for display in public pages
 * @param scheduleString - The schedule string from the database
 * @returns Formatted schedule text for display
 */
export function formatScheduleForDisplay(scheduleString: string | null | undefined): string {
  if (!scheduleString || scheduleString.trim() === '') {
    return 'Horarios no disponibles';
  }

  // Check for 24/7 format
  if (scheduleString.includes('24/7') || scheduleString.toLowerCase().includes('abierto 24/7')) {
    return 'Abierto 24/7';
  }

  // Check for common closed patterns
  if (scheduleString.toLowerCase().includes('cerrado')) {
    return 'Cerrado';
  }

  // Return the original string if it's already formatted
  return scheduleString;
}

/**
 * Checks if a park is currently open based on its schedule
 * @param scheduleString - The schedule string from the database
 * @returns Boolean indicating if the park is currently open
 */
export function isParkCurrentlyOpen(scheduleString: string | null | undefined): boolean {
  if (!scheduleString || scheduleString.trim() === '') {
    return false;
  }

  // 24/7 parks are always open
  if (scheduleString.includes('24/7') || scheduleString.toLowerCase().includes('abierto 24/7')) {
    return true;
  }

  // If marked as closed
  if (scheduleString.toLowerCase().includes('cerrado')) {
    return false;
  }

  // For other schedules, we would need more complex parsing
  // This is a simplified version that can be enhanced
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinutes;

  // Basic time extraction for simple formats
  const timeMatch = scheduleString.match(/(\d{1,2}):?(\d{2})?\s*(?:a|-)?\s*(\d{1,2}):?(\d{2})?/);
  
  if (timeMatch) {
    const openHour = parseInt(timeMatch[1]);
    const openMin = parseInt(timeMatch[2] || '0');
    const closeHour = parseInt(timeMatch[3]);
    const closeMin = parseInt(timeMatch[4] || '0');
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    // Handle cases where closing time is next day (e.g., 22:00 - 06:00)
    if (closeTime < openTime) {
      return currentTime >= openTime || currentTime <= closeTime;
    } else {
      return currentTime >= openTime && currentTime <= closeTime;
    }
  }

  // Default to unknown/closed if we can't parse
  return false;
}

/**
 * Gets a status badge info for the park schedule
 * @param scheduleString - The schedule string from the database
 * @returns Object with status text and color class
 */
export function getScheduleStatus(scheduleString: string | null | undefined): {
  text: string;
  colorClass: string;
  isOpen: boolean;
} {
  if (!scheduleString || scheduleString.trim() === '') {
    return {
      text: 'Horarios no disponibles',
      colorClass: 'bg-gray-100 text-gray-600',
      isOpen: false
    };
  }

  // 24/7 parks
  if (scheduleString.includes('24/7') || scheduleString.toLowerCase().includes('abierto 24/7')) {
    return {
      text: 'Abierto 24/7',
      colorClass: 'bg-green-100 text-green-800',
      isOpen: true
    };
  }

  // Closed parks
  if (scheduleString.toLowerCase().includes('cerrado')) {
    return {
      text: 'Cerrado',
      colorClass: 'bg-red-100 text-red-800',
      isOpen: false
    };
  }

  // Check if currently open
  const isOpen = isParkCurrentlyOpen(scheduleString);
  
  return {
    text: isOpen ? 'Abierto ahora' : 'Cerrado ahora',
    colorClass: isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
    isOpen
  };
}

/**
 * Parse schedule string into structured format
 * @param scheduleString - The schedule string from the database
 * @returns Parsed schedule object
 */
export function parseScheduleString(scheduleString: string | null | undefined): ParsedSchedule {
  if (!scheduleString || scheduleString.trim() === '') {
    return {
      is24_7: false,
      isClosed: true,
      schedules: []
    };
  }

  // Check for 24/7
  if (scheduleString.includes('24/7') || scheduleString.toLowerCase().includes('abierto 24/7')) {
    return {
      is24_7: true,
      isClosed: false,
      schedules: [{
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        openTime: '00:00',
        closeTime: '23:59',
        isClosed: false
      }]
    };
  }

  // Check for closed
  if (scheduleString.toLowerCase().includes('cerrado')) {
    return {
      is24_7: false,
      isClosed: true,
      schedules: []
    };
  }

  // For other formats, return a basic structure
  // This can be enhanced to parse more complex schedule strings
  return {
    is24_7: false,
    isClosed: false,
    schedules: [{
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      openTime: '09:00',
      closeTime: '18:00',
      isClosed: false
    }]
  };
}