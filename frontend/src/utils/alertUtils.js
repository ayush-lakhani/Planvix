import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Common SweetAlert2 configuration matched to the dark theme styling.
const baseConfig = {
  background: '#1e293b', // Tailwind slate-800
  color: '#f8fafc', // Tailwind slate-50
  confirmButtonColor: '#6366f1', // Tailwind indigo-500
  cancelButtonColor: '#ef4444', // Tailwind red-500
  customClass: {
    popup: 'rounded-xl border border-slate-700 shadow-2xl',
    confirmButton: 'px-6 py-2 rounded-lg font-medium transition-colors hover:bg-indigo-600',
    cancelButton: 'px-6 py-2 rounded-lg font-medium transition-colors hover:bg-red-600',
    title: 'text-xl font-bold text-slate-100',
    htmlContainer: 'text-slate-300'
  }
};

export const alertUtils = {
  /**
   * Display a standard success notification.
   */
  success: (title, text = '') => {
    return MySwal.fire({
      ...baseConfig,
      icon: 'success',
      title,
      text,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  },

  /**
   * Display an error message.
   */
  error: (title, text = '') => {
    return MySwal.fire({
      ...baseConfig,
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Try Again',
    });
  },

  /**
   * Display a warning message.
   */
  warning: (title, text = '') => {
    return MySwal.fire({
      ...baseConfig,
      icon: 'warning',
      title,
      text,
      confirmButtonText: 'Understood',
    });
  },

  /**
   * Standardized confirmation dialog (e.g. for deletions).
   * @returns {Promise<boolean>} True if confirmed
   */
  confirm: async (title, text = "You won't be able to revert this!") => {
    const result = await MySwal.fire({
      ...baseConfig,
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, proceed',
      cancelButtonText: 'Cancel',
      reverseButtons: true, // Cancel on the left, Confirm on the right
    });
    return result.isConfirmed;
  },
  
  /**
   * Specifically styled deletion confirmation.
   */
  confirmDelete: async (entityName = 'item') => {
    return alertUtils.confirm(
      'Are you sure?',
      `Do you really want to delete this ${entityName}? This action cannot be undone.`
    );
  }
};
