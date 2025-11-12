import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Fetch all contributors grouped by publication
export const useContributorsByPublication = () => {
  return useQuery({
    queryKey: ['contributors-by-publication'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/contributors/by-publication/`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Fetch contributors for a specific publication
export const useContributorsByPublicationId = (publicationId) => {
  return useQuery({
    queryKey: ['contributors', publicationId],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/contributors/?publication_id=${publicationId}`);
      return response.data;
    },
    enabled: !!publicationId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Fetch all contributors
export const useAllContributors = () => {
  return useQuery({
    queryKey: ['contributors-all'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/contributors/`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};
