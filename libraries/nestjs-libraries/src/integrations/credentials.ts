// Re-export shim — relocated to @validpost/provider-kernel (step 7.5.2).
// The in-memory credential cache lives in the kernel module so it stays
// single-instance across IntegrationManager (writer) and providers (reader).
export {
  type CredentialEntry,
  setCredentials,
  getCredential,
  clearOrgCredentials,
  clearAllCredentials,
  clearCredentials,
  replaceCredentialsMap,
  getOrgCredential,
} from '@validpost/provider-kernel';
