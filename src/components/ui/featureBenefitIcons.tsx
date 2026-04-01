import { CreditCard, RotateCcw, Shield, Truck } from 'lucide-react';

export const featureBenefitIcons = {
  Truck,
  RotateCcw,
  Shield,
  CreditCard,
} as const;

export const getFeatureBenefitIcon = (iconName: string) => {
  return featureBenefitIcons[iconName as keyof typeof featureBenefitIcons] || Shield;
};
