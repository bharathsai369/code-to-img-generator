import React, { FC, ReactNode } from 'react';

interface ControlGroupProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export const ControlGroup: FC<ControlGroupProps> = ({ label, children, className }) => (
  <div className={className}>
    <label className="text-sm font-semibold text-gray-700 block mb-2">{label}</label>
    {children}
  </div>
);
