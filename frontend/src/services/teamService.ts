import api from './api';

export interface TeamMember {
    id?: number;
    name: string;
    email: string;
    department: string;
}

export const teamService = {
    getTeamMembers: async () => {
        const response = await api.get<TeamMember[]>('/team/');
        return response.data;
    },

    saveTeamMember: async (member: TeamMember) => {
        if (member.id) {
            const response = await api.put<TeamMember>(`/team/${member.id}/`, member);
            return response.data;
        } else {
            const response = await api.post<TeamMember>('/team/', member);
            return response.data;
        }
    },

    deleteTeamMember: async (id: number) => {
        await api.delete(`/team/${id}/`);
    },
};
