
'use client';

import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { iconData, PlayerIcons, PlayerIconKey } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { PlayerIconType } from '@/lib/types';

interface IconPickerProps {
  value: PlayerIconType;
  onValueChange: (value: PlayerIconType) => void;
  disabledIcons?: PlayerIconType[];
}

export function IconPicker({ value, onValueChange, disabledIcons = [] }: IconPickerProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onValueChange}
      className="grid grid-cols-3 gap-4"
      aria-label="Player Icon"
    >
      {iconData.map(({ name, label }) => {
        const iconSrc = PlayerIcons[name as PlayerIconKey];
        const isDisabled = disabledIcons.includes(name);
        return (
          <div key={name}>
            <RadioGroupItem 
              value={name} 
              id={name} 
              className="peer sr-only"
              disabled={isDisabled}
            />
            <Label
              htmlFor={name}
              className={cn(
                'flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 h-32',
                'peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary',
                isDisabled 
                  ? 'cursor-not-allowed opacity-50 bg-muted/50'
                  : 'cursor-pointer hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Image key={iconSrc} src={iconSrc} alt={label} width={64} height={64} className="mb-2 h-16 w-16 object-contain" />
              <span className="text-sm text-center">{label}</span>
              {isDisabled && <span className="text-xs text-destructive font-bold mt-1">En uso</span>}
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}
