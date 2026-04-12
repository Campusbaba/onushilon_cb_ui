"use client";

import React from "react";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxList,
    ComboboxItem,
} from "@/components/ui/combobox";

interface FormComboboxProps<T> {
    items: T[];
    value: string;
    onValueChange: (value: string | any | null) => void;
    placeholder: string;
    renderItem: (item: T) => React.ReactNode;
    getItemValue: (item: T) => string;
    getItemLabel?: (item: T) => string;
    emptyText?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

export function FormCombobox<T>({
    items,
    value,
    onValueChange,
    placeholder,
    renderItem,
    getItemValue,
    getItemLabel,
    emptyText = "No items found.",
    required,
    disabled,
    className,
}: FormComboboxProps<T>) {
    const itemToStringLabel = getItemLabel
        ? (id: string) => {
            const found = items.find(i => getItemValue(i) === id);
            return found ? getItemLabel(found) : id;
        }
        : undefined;

    return (
        <div className={className}>
            <Combobox
                items={items}
                value={value}
                onValueChange={onValueChange}
                disabled={disabled}
                itemToStringLabel={itemToStringLabel}
            >
                <ComboboxInput placeholder={placeholder} required={required} disabled={disabled} />
                <ComboboxContent>
                    <ComboboxEmpty>{emptyText}</ComboboxEmpty>
                    <ComboboxList>
                        {(item: T) => (
                            <ComboboxItem
                                key={getItemValue(item)}
                                value={getItemValue(item)}
                            >
                                {renderItem(item)}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </div>
    );
}
