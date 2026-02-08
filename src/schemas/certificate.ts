import { z } from 'zod';

// proxmox_get_node_certificates - Get node certificate information
export const getNodeCertificatesSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type GetNodeCertificatesInput = z.infer<typeof getNodeCertificatesSchema>;

// proxmox_upload_custom_certificate - Upload custom SSL certificate
export const uploadCustomCertificateSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  certificates: z.string().describe('PEM encoded certificate(s)'),
  key: z.string().optional().describe('PEM encoded private key'),
  force: z.boolean().optional().describe('Overwrite existing custom certificate'),
  restart: z.boolean().optional().describe('Restart pveproxy service'),
});

export type UploadCustomCertificateInput = z.infer<typeof uploadCustomCertificateSchema>;

// proxmox_delete_custom_certificate - Delete custom SSL certificate
export const deleteCustomCertificateSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type DeleteCustomCertificateInput = z.infer<typeof deleteCustomCertificateSchema>;

// proxmox_order_acme_certificate - Order ACME certificate
export const orderAcmeCertificateSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  force: z.boolean().optional().describe('Force renewal even if certificate is still valid'),
});

export type OrderAcmeCertificateInput = z.infer<typeof orderAcmeCertificateSchema>;

// proxmox_renew_acme_certificate - Renew ACME certificate
export const renewAcmeCertificateSchema = z.object({
  node: z.string().min(1).describe('Node name'),
  force: z.boolean().optional().describe('Force renewal even if certificate is still valid'),
});

export type RenewAcmeCertificateInput = z.infer<typeof renewAcmeCertificateSchema>;

// proxmox_revoke_acme_certificate - Revoke ACME certificate
export const revokeAcmeCertificateSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type RevokeAcmeCertificateInput = z.infer<typeof revokeAcmeCertificateSchema>;

// proxmox_get_node_acme_config - Get node ACME configuration
export const getNodeAcmeConfigSchema = z.object({
  node: z.string().min(1).describe('Node name'),
});

export type GetNodeAcmeConfigInput = z.infer<typeof getNodeAcmeConfigSchema>;
