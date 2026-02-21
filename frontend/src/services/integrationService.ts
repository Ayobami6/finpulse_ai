import api from './api';

export interface IntegrationConfig {
    id?: number;
    source_type: 'whatsapp' | 'freshchat';
    api_key: string;
    webhook_secret?: string;
    account_url?: string;
    is_active: boolean;
    last_synced_at?: string;
    created_at?: string;
    updated_at?: string;
}

export const integrationService = {
    getIntegrations: async () => {
        const response = await api.get<IntegrationConfig[]>('/integrations/');
        return response.data;
    },

    saveIntegration: async (config: IntegrationConfig) => {
        if (config.id) {
            const response = await api.put<IntegrationConfig>(`/integrations/${config.id}/`, config);
            return response.data;
        } else {
            const response = await api.post<IntegrationConfig>('/integrations/', config);
            return response.data;
        }
    },

    deleteIntegration: async (id: number) => {
        await api.delete(`/integrations/${id}/`);
    },
};
