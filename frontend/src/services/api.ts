import axios from 'axios';
import { MOCK_DASHBOARD_DATA, MOCK_ISSUES, MOCK_CHATS, MOCK_INTEGRATIONS, MOCK_TEAM } from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.defaults.adapter = async (config) => {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let mockData: any = null;
    const url = config.url || '';
    const method = config.method?.toLowerCase();

    if (url.includes('/dashboard/executive_summary')) {
        mockData = MOCK_DASHBOARD_DATA;
    } else if (url.includes('/clusters/')) {
        mockData = { results: MOCK_ISSUES };
    } else if (url.includes('/chats/')) {
        mockData = { results: MOCK_CHATS };
    } else if (url.includes('/integrations/')) {
        if (method === 'get') {
            mockData = MOCK_INTEGRATIONS;
        } else if (method === 'post' || method === 'put') {
            const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
            mockData = { id: Date.now(), ...data };
        } else if (method === 'delete') {
            mockData = { success: true };
        }
    } else if (url.includes('/team/')) {
        if (method === 'get') {
            mockData = MOCK_TEAM;
        } else if (method === 'post' || method === 'put') {
            const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
            mockData = { id: Date.now(), ...data };
        } else if (method === 'delete') {
            mockData = { success: true };
        }
    }

    if (mockData !== null) {
        return {
            data: mockData,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
            request: {}
        } as any;
    }

    // Default response if not matched
    return {
        data: {},
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config,
        request: {}
    } as any;
};

export default api;
