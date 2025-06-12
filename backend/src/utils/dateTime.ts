/**
 * Converts Neo4j DateTime objects to ISO strings consistently
 * Handles both Neo4j DateTime objects and regular Date objects
 */
export function formatDateTime(dateValue: any): string {
    if (!dateValue) {
      return new Date().toISOString();
    }
    
    // If it's already a string, return as-is
    if (typeof dateValue === 'string') {
      return dateValue;
    }
    
    // If it's a Date object, convert to ISO string
    if (dateValue instanceof Date) {
      return dateValue.toISOString();
    }
    
    // If it's a Neo4j DateTime object, it should have a toString method that returns ISO format
    if (dateValue && typeof dateValue.toString === 'function') {
      return dateValue.toString();
    }
    
    // Fallback: try to create a new Date from the value
    try {
      return new Date(dateValue).toISOString();
    } catch (error) {
      console.warn('Failed to convert date value:', dateValue, error);
      return new Date().toISOString();
    }
  }
  
  /**
   * Processes Neo4j record properties to ensure consistent DateTime formatting
   */
  export function processRecordProperties(properties: any): any {
    const processed = { ...properties };
    
    // Convert common date fields
    if (processed.createdAt) {
      processed.createdAt = formatDateTime(processed.createdAt);
    }
    
    if (processed.updatedAt) {
      processed.updatedAt = formatDateTime(processed.updatedAt);
    }
    
    return processed;
  }