import Swal from 'sweetalert2';

export const alertConfirm = async (title, text) => {
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2563eb', // Azul corporativo
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Sí, confirmar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  });
  return result.isConfirmed; 
};

export const alertSuccess = (title, text) => {
  Swal.fire({
    title,
    text,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false
  });
};

// ESTA ES LA QUE FALTABA
export const alertError = (title, text) => {
  Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#ef4444', // Rojo para errores
    confirmButtonText: 'Entendido'
  });
};