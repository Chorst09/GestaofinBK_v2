
"use client";

import { useMemo, useCallback } from 'react';
import { useCategories } from './useCategories';
import { TRANSACTION_CATEGORIES as predefinedCategories, CategoryConfig } from '@/components/transactions/categories';
import { getIconComponent } from '@/components/categories/category-icons';
import { HelpCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type CombinedCategory = CategoryConfig & { isCustom?: boolean, id?: string };

export function useAllCategories() {
    const { customCategories } = useCategories();

    const allCategories: CombinedCategory[] = useMemo(() => {
        const customCategoryConfigs: CombinedCategory[] = customCategories.map(c => ({
            id: c.id,
            name: c.name,
            type: c.type,
            icon: getIconComponent(c.icon),
            isCustom: true
        }));
        
        const predefined = predefinedCategories.map(c => ({...c, isCustom: false}));
        
        // Filter out predefined categories that have the same name as a custom one.
        const filteredPredefined = predefined.filter(p => 
            !customCategoryConfigs.some(c => c.name.toLowerCase() === p.name.toLowerCase())
        );
        
        return [...filteredPredefined, ...customCategoryConfigs].sort((a,b) => a.name.localeCompare(b.name));
    }, [customCategories]);

    const getCategoriesByType = useCallback((type: 'income' | 'expense') => {
        return allCategories.filter(c => c.type === type || c.type === 'general');
    }, [allCategories]);
    
    const getCategoryByName = useCallback((name?: string): CombinedCategory | undefined => {
        if (!name) return undefined;
        return allCategories.find(c => c.name.toLowerCase() === name.toLowerCase());
    }, [allCategories]);

    const getCategoryIcon = useCallback((name?: string): LucideIcon => {
        return getCategoryByName(name)?.icon || HelpCircle;
    }, [getCategoryByName]);

    return { allCategories, getCategoriesByType, getCategoryByName, getCategoryIcon };
}
