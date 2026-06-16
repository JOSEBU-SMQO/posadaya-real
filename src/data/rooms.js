// Datos de ejemplo para la galería de habitaciones.
// Más adelante esto vendrá de una base de datos / API.
export const rooms = [
  {
    id: 1,
    nombre: 'Habitación Doble Estándar',
    descripcion:
      'Acogedora habitación con cama de matrimonio, baño privado y vistas al jardín.',
    capacidad: 2,
    precioPorNoche: 65,
    imagen:
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
    disponible: true,
  },
  {
    id: 2,
    nombre: 'Suite Familiar',
    descripcion:
      'Amplia suite con dos dormitorios, salón y terraza. Ideal para familias.',
    capacidad: 4,
    precioPorNoche: 120,
    imagen:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    disponible: true,
  },
  {
    id: 3,
    nombre: 'Habitación Individual',
    descripcion:
      'Habitación compacta y luminosa, perfecta para viajeros que buscan descansar.',
    capacidad: 1,
    precioPorNoche: 45,
    imagen:
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    disponible: false,
  },
]
