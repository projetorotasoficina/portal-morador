import { cpf } from 'cpf-cnpj-validator';

export function useCPFValidation() {
  const validateCPF = (value: string): boolean => {
    if (!value) return true; // CPF é opcional
    return cpf.isValid(value);
  };

  const formatCPF = (value: string): string => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara: 000.000.000-00
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    }
  };

  const removeCPFMask = (value: string): string => {
    return value.replace(/\D/g, '');
  };

  return {
    validateCPF,
    formatCPF,
    removeCPFMask,
  };
}
