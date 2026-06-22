/**
 * Formatea un número como precio en pesos chilenos.
 * Ejemplo: 15000 → "$15.000"
 */
export function formatPrecio(valor: number): string {
  return `$${valor.toLocaleString('es-CL')}`;
}

/**
 * Formatea una fecha ISO a formato legible en español.
 * Ejemplo: "2024-06-15T10:30:00Z" → "15/06/2024, 10:30:00"
 */
export function formatFecha(fechaISO?: string): string {
  if (!fechaISO) return 'No registrada';
  return new Date(fechaISO).toLocaleString('es-CL');
}

/**
 * Genera un número aleatorio entre min y max (inclusivo).
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
