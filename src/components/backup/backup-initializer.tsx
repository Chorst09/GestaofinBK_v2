"use client";

import { useDataBackup } from '@/hooks/useDataBackup';

/**
 * This component's only purpose is to consume the data backup context
 * at the root of the application, ensuring its provider is active.
 * The auto-save logic is handled within the provider itself, which is
 * always mounted at the application root.
 */
export function BackupInitializer() {
  // By consuming the hook here, we ensure that this component is a child
  // of the provider, and the provider's effects (like auto-saving)
  // are active for the entire application lifecycle.
  useDataBackup();
  
  // This component does not render any UI.
  return null;
}
